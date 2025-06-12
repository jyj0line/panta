export const COMMON = {
    // crpto
    SALT_OR_ROUNDS: 10,
    
    // chunked request
    LIMIT_MAX: 100,
    
    // search
    SEARCH_MAX: 100,

    // images
    UPLOAD_URL_PREFIX: "https://api.cloudinary.com/v1_1/",
    UPLOAD_URL_SUFFIX: "/image/upload",
    PROFILE_IMAGE_FOLDER_NAME: 'profile_images',
    ACCEPTED_MIME_TYPES: ["image/jpeg", "image/png"],
    ACCEPTED_EXTENSIONS: ["jpg", "jpeg", "png"],
    PROFILE_IMAGE_SIZE_MAX: 100 * 1024 * 1024, // 100MB. cloudinary limit
}

export const USER = {
    USER_ID_MIN: 1,
    USER_ID_MAX: 32,
    USER_HASHED_PASSWORD_LENGTH: 60,
    USER_BIO_MAX: 250,

    USER_UNHASHED_PASSWORD_MIN: 6, // not on the database
    USER_UNHASHED_PASSWORD_MAX: 60 // not on the database
}

export const BOOK = {
    BOOK_TITLE_MIN: 0,
    BOOK_TITLE_MAX: 100
}

export const PAGE = {
    PAGE_TITLE_MIN: 1,
    PAGE_TITLE_MAX: 255,
    PAGE_PREVIEW_MAX: 255,
    PAGE_CONTENT_MAX: 100000,
    PAGE_VIEW_MIN: 0,
    PAGE_VIEW_MAX: 99999999,
    PAGE_LIKE_MIN: 0,
    PAGE_LIKE_MAX: 99999999
}

export const TAG = {
    TAG_ID_MIN: 1,
    TAG_ID_MAX: 25,
    TAG_ID_NUM_MAX: 25 // not on the database
}

export const SEARCH_PARAMS = {
    P_PARAM: 'p',
    P_INIT_VALUE: '1',

    OD_PARAM: 'od',
    OD_ASC_VALUE: 'asc',

    SEARCH_PARAM: 'search',
    TAG_PARAM: 'tag',
    USER_PARAM: 'user',
    CREATED_AT_FROM_PARAM: 'created_at_from',
    CREATED_AT_TO_PARAM: 'created_at_to'
}

export const COOKIE_PARAMS = {
    NOTI_PARAM: 'noti'
};

export const WORD_BLOCK = {
    SEARCH_SLIPS_UPPER: 'Search Slips',
    SEARCH_SLIPS_LOWER:'search slips',

    BOOK_PAGE_SLIPS_UPPER: 'Book Page Slips',
    BOOK_PAGE_SLIPS_LOWER:'book page slips'
}

export const METADATA = {
    NOT_FOUND_TITLE_METADATA: "Not Found",
    WRITE_TITLE_METADATA: "Write"
}

export const ERROR_CODE = {
    NETWORK_PROBLEM: 'network_error',
    INVALID_DATA: 'invalid_data_error',
    NOT_FOUND: 'not_found_error'
} as const;
export type ErrorCode = typeof ERROR_CODE[keyof typeof ERROR_CODE];

export const DEFAULT = {
    DEFAULT_PROFILE_IMAGE_URL: '/defaultProfileImage.svg',
    DEFAULT_BOOK_IMAGE_URL: '/book.svg'
}

export const PLACEHOLDER = {
    SEARCH_PLACEHOLDER : 'Enter what you want to search for.',
    TAG_IDS_PLACEHOLDER: 'tag',
    USER_IDS_PLACEHOLDER: 'user',

    BOOK_TITLE_PLACEHOLDER: "Enter the book title."
}

export const LOADING = {
    UPLOADING_PROFILE_IMAGE: "You are uploading your profile image now..."
}

export const SKIP = {
    UPDATE_INFO_SUCCESS_SKIP: "You've updated your information successfully, but skipped for the later update.",
    REFRESH_INFO_SUCCESS_SKIP: "You've refreshed your information successfully, but skipped for the later update.",

    UPDATE_INFO_SOMETHING_ERROR_SKIP: "Something went wrong while updating your information, but skipped for the later update.",
    REFRESH_INFO_SOMETHING_ERROR_SKIP: "Something went wrong while refreshing your information, but skipped for the later update.",
}

export const SUCCESS = {
    UPDATE_INFO_SUCCESS: "You've updated your information successfully.",
    REFRESH_INFO_SUCCESS: "You've refreshed your information successfully.",

    SIGN_UP_SUCCESS: "You've signed up successfully.",

    LOG_IN_SUCCESS: "You've logged in successfully.",

    CHANGE_PASSWORD_SUCCESS: "You've changed your password successfully.",
    
    LOG_OUT_SUCCESS: "You've logged out successfully.",

    DELETE_ACCOUNT_SUCCESS: "You've deleted your account successfully.",

    AUTH_SUCCESS: "You've authenticated successfully.",

    UPDATE_PROFILE_IMAGE_URL_SUCCESS: "You've updated your profile image successfully.",
    UPDATE_BIO_SUCCESS: "You've updated your bio successfully.",

    CREATE_PROFILE_IMAGE_SUCCESS: "You've created your profile image successfully.",
    CHANGE_PROFILE_IMAGE_SUCCESS: "You've changed your profile image successfully.",
    DELETE_PROFILE_IMAGE_SUCCESS: "You've deleted your profile image successfully.",

    CREATE_PAGE_SUCCESS: "You've created the page successfully.",
    UPDATE_PAGE_SUCCESS: "You've updated the page successfully.",

    DELETE_BOOK_SUCCESS: "You've deleted the book successfully."
}

export const ERROR = {
    PLEASE_TRY_AGAIN_LATER_ERROR: "Something is not ready yet. Please try again later.",
    SOMETHING_WENT_WRONG_ERROR: "Something went wrong. Please try again later.",
    INVALID_INPUT_ERROR: "Please enter valid information.",
    UNAUTHENTICATED_ERROR: "Unauthenticated",
    FORBIDDEN_ERROR: "Forbidden",

    UPDATE_INFO_SOMETHING_ERROR: "Something went wrong while updating your information. Please try again later or logging in again later.",
    REFRESH_INFO_SOMETHING_ERROR: "Something went wrong while refreshing your information. But the work is completed",

    USER_ID_SOMETHING_ERROR: "Something went wrong while checking your ID. Please try again later.",
    USER_ID_DUPLICATION_ERROR: 'This is not an available ID.',

    UNHASHED_PASSWORD_SOMETHING_ERROR: "Something went wrong with the password check. Please try again later.",
    UNHASHED_PASSWORD_FOR_CONFIRM_DIFF_ERROR: "Two passwordsThe two passwords do not match.",

    INCORRECT_PASSWORD_ERROR: "The password is incorrect.",

    SIGN_UP_SOMETHING_ERROR: "Something went wrong while creating your account. Please try again later.",
    SIGN_UP_INPUT_ERROR: "Please enter valid information.",

    LOG_IN_SOMETHING_ERROR: "Something went wrong while logging you in. Please try again later.",
    LOG_IN_CREDENTIAL_ERROR: "Please enter valid information.",
    
    LOG_OUT_SOMETHING_WENT_WRONG_ERROR: "Something went wrong while logging you out. Please try again later.",

    DELETE_ACCOUNT_DELETE_PROFILE_IMAGE_ERROR: "Something went wrong while deleting your profile image.",
    DELETE_ACCOUNT_UNCHECKED_ERROR: "Please confirm that you've read and agreed to the account deletion notice for deleting your account.",
    
    AUTH_SOMETHING_ERORR: "Something went wrong while authenficating you. Please try again later.",

    UPDATE_BIO_SOMETHING_ERROR: "Something went wrong while updating your bio. Please try again later.",
    UPDATE_BIO_INPUT_ERROR: "Please enter valid bio.",

    SELECT_PROFILE_IMAGE_SOMETHING_ERROR: "Something went wrong while selecting your profile image. Please try again later.",
    CREATE_PROFILE_IMAGE_SOMETHING_ERROR: "Something went wrong while creating your profile image. Please try again later.",
    CHANGE_PROFILE_IMAGE_SOMETHING_ERROR: "Something went wrong while changing your profile image. Please try again later.",
    DELETE_PROFILE_IMAGE_SOMETHING_ERROR: "Something went wrong while deleting your profile image. Please try again later.",
    UPDATE_PROFILE_IMAGE_SOMETHING_ERROR: "Something went wrong while updating your profile image. Please try uploading your profile image again later or logging in again later.",
    
    UPDATE_PROFILE_IMAGE_URL_SOMETHING_ERROR: "Something went wrong while updating your profile image. Please try uploading your profile image again later or logging in again later.",
    UPDATE_PROFILE_IMAGE_URL_INPUT_ERROR: "Please enter valid profile image.",

    CREATE_WRITE_SOMETHING_ERROR: "Something went wrong while creating the page. Please try again later.",
    UPDATE_WRITE_SOMETHING_ERROR: "Something went wrong while updating the page. Please try again later.",

    DELETE_BOOK_SOMETHING_ERROR: "Something went wrong while deleting the book."
}

export const DESCRIPTION = {
    USER_UNHASHED_PASSWORD_DESCRIPTION: `- Use ${USER.USER_UNHASHED_PASSWORD_MIN} ~ ${USER.USER_UNHASHED_PASSWORD_MAX} characters with English characters, numbers, and special characters.`,

    ACCOUNT_DELETION_NOTICE: 'Once your account is deleted, all your activity — including pages, books, subscriptions, and likes — will be permanently removed and cannot be recovered.',
    ACCOINT_DELETION_BUTTON_NOTICE: "Clicking this button will permanently delete your account.",

    NO_PAGES_YET: 'No Pages yet',
    NO_BOOK_PAGES_YET: 'No Book Pages yet'
}