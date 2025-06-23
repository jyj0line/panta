'use client';

import { useState, createContext, useContext, useEffect, useRef } from 'react';
import type { User } from 'next-auth';
import { useSession } from "next-auth/react";

import { getAuthenticatedUserASF } from '@/app/lib/SF/afterAuthSFs';

import { SKIP, SUCCESS, ERROR } from '@/app/lib/constants';
const {
  UPDATE_INFO_SUCCESS,
  REFRESH_INFO_SUCCESS
} = SUCCESS;
const {
  UPDATE_INFO_SOMETHING_ERROR,
  REFRESH_INFO_SOMETHING_ERROR
} = ERROR;

type UpdateKeys = {
  _update: {
    "profile_image_url"?: true,
    "bio"?: true,
  }
};

type UpdateState = {
  success: boolean
  message: string
}
type RefreshState = {
  success: boolean
  message: string
}

type SCtxedUserContextValue = {
  user: User | null;
  isUserFirstLoading: boolean;
  updateSessionUser: (updateKeys: UpdateKeys) => Promise<UpdateState>
  refreshSessionUser: () => Promise<RefreshState>
};

const SCtxedUserContext = createContext<SCtxedUserContextValue>({
  user: null,
  isUserFirstLoading: true,
  updateSessionUser: async () => ({ success: false, message: UPDATE_INFO_SOMETHING_ERROR }),
  refreshSessionUser: async () => ({ success: false, message: REFRESH_INFO_SOMETHING_ERROR }),
});

export const SessCtxedUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserFirstLoading, setIsUserFirstLoading] = useState<boolean>(true);
  const { update } = useSession();
  const cidRef = useRef<number>(0);

  const updateSessionUser = async (updateKeys: UpdateKeys): Promise<UpdateState> => {
    const cid = ++cidRef.current;

    try {
      await update(updateKeys);
      const updatedUser = await getAuthenticatedUserASF();

      if (cid !== cidRef.current) {
        return {
          success: true,
          message: SKIP.UPDATE_INFO_SUCCESS_SKIP
        }
      }

      setUser(updatedUser);

      return {
        success: true,
        message: UPDATE_INFO_SUCCESS
      }
    } catch (e) {
      console.error(e);
      if (cid !== cidRef.current) {
        return {
          success: true,
          message: SKIP.UPDATE_INFO_SOMETHING_ERROR_SKIP
        }
      }

      return {
        success: false,
        message: UPDATE_INFO_SOMETHING_ERROR
      };
    }
  };
  
  const refreshSessionUser = async (): Promise<UpdateState> => {
    const cid = ++cidRef.current;

    try {
      const refreshedUser = await getAuthenticatedUserASF();

      if (cid !== cidRef.current) {
        return {
          success: true,
          message: SKIP.REFRESH_INFO_SUCCESS_SKIP
        }
      }

      setUser(refreshedUser);

      return {
        success: true,
        message: REFRESH_INFO_SUCCESS
      }
    } catch (e) {
      console.error(e);
      if (cid !== cidRef.current) {
        return {
          success: true,
          message: SKIP.REFRESH_INFO_SOMETHING_ERROR_SKIP
        }
      }

      return {
        success: false,
        message: REFRESH_INFO_SOMETHING_ERROR
      };
    }
  };


  useEffect(() => {
    const setUserOnMount = async () => {
      const cid = ++cidRef.current;

      try {
        const fetchedUser = await getAuthenticatedUserASF();
        
        if (cid !== cidRef.current) {
          return;
        }

        setUser(fetchedUser);
      } catch (e) {
        console.error(e);
        if (cid !== cidRef.current) {
          return;
        }

        setUser(null);
      } finally {
        if (cid === cidRef.current) {
          setIsUserFirstLoading(false);
        }
      }
    };
     
    setUserOnMount();

    return () => {
      cidRef.current = 0;
    }
  }, []);

  return (
    <SCtxedUserContext.Provider value={{ user, isUserFirstLoading, updateSessionUser, refreshSessionUser }}>
      {children}
    </SCtxedUserContext.Provider>
  );
};

export const useSCtxedUserContext = () => {
  const context = useContext(SCtxedUserContext);
  if (!context) {
      throw new Error("useSessCtxedUserContext must be used within a SessCtxedUserProvider");
  }
  return context;
}