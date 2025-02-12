"use client";
import { useState } from 'react';
import { NextResponse } from 'next/server';

import { sqlInsertUser, sqlInsertPage } from "@/app/lib/sqls";
import { hashPassword } from '@/app/lib/utils';
import { users, pages } from '@/app/tmp/placeholder-data';

export const CreateAndInsertForSeed = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateUsersTable = async () => {
    setLoading(true);
    setMessage("");

    try {
      const usersWithHashedPassword = await Promise.all(
        users.map(async (user) => {
          const hashedPassword = await hashPassword(user.unhashed_password);
          return { ...user, hashed_password: hashedPassword }
        })
      );

      const results = await Promise.allSettled(usersWithHashedPassword.map(user => sqlInsertUser(user)));

      const successCount = results.filter(result => result.status === "fulfilled").length;
      const failureCount = results.filter(result => result.status === "rejected").length;

      if (failureCount > 0) {
        setMessage(`${failureCount} users failed to insert.`);
        console.error("Some user insertions failed", results);
      } else {
        setMessage(`${successCount} users inserted successfully.`);
      }

      return NextResponse.json({ message: `${successCount} users inserted successfully.` });
    } catch (error) {
      setMessage("Error inserting users.");
      console.error(error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Database SQL</h1>
      <button
        onClick={handleCreateUsersTable}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        {loading ? "Inserting Users..." : "Insert Users"}
      </button>
      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
};