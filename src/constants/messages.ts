// bunch of ids to use in the front end translation
export const MESSAGES = {
    LOGGED_IN: 'logged_in',
    NOT_LOGGED_IN: 'not_logged_in',
    NOT_ADMIN: 'not_admin',
    SESSION_EXPIRED: 'session_expired',
    NOT_FOUND: 'not_found',
    SERVER_ERROR: 'server_error',
    RATE_LIMITED: 'you_have_been_rate_limited',
    MAINTENANCE: 'app_under_maintenance',
    MAINTENANCE_SUCCESS: 'app_maintenance_success',
    VALIDATION: {
        ID: 'validation_id',
        LOGIN: 'validation_login',
        DOB: 'validation_dob',
        EMAIL: 'validation_email',
        USERNAME: 'validation_username',
        PASSWORD: 'validation_password',
        CONFIRMATION: 'validation_password_confirmation',
        EXP: 'validation_expiration',
        STATE: 'validation_state',
        BAN_REASON: 'validation_ban_reason',
        GAME: 'validation_game',
        GAMES: 'validation_games',
        PARTICIPANTS: 'validation_participants',
        PARTICIPANTS_MODEL: 'validation_participants_model',
        PARTICIPANTS_LIMIT: 'validation_participants_limit',
        WINNERS_MODEL: 'validation_winners_model',
        TITLE: 'validation_title',
        GIFT: 'validation_gift',
        DATE: 'validation_date',
        RANK: 'validation_rank',
        GIFT_REWARD: 'validation_gift_reward',
        GIFT_TYPE: 'validation_gift_type',
        NAME: 'validation_name',
        TAG: 'validation_tag',
        AVATAR_TYPE: 'validation_avatar_type',
        MAINTENANCE: 'validation_maintenance'
    },
    REGISTER: {
        SUCCESS: 'register_success',
        INVALID: 'register_invalid'
    },
    LOGIN: {
        SUCCESS: 'login_success',
        INVALID: 'login_invalid',
        LOCKED: 'login_locked'
    },
    LOGOUT: {
        SUCCESS: 'logout_success'
    },
    EMAIL: {
        VERIFICATON_SUCCESS: 'email_verification_success',
        INVALID_DATA: 'email_invalid_data',
        ALREADY_VERIFIED: 'email_already_verified',
        NOT_VERIFIED: 'email_not_verified'
    },
    PASSWORD: {
        RESET_ANSWER: 'password_reset_answer',
        INVALID: 'password_new_invalid',
        SUCCESS: 'password_new_success'
    },
    TOURNAMENT: {
        NOT_HOST: 'tournament_not_host',
        NOT_FOUND: 'tournament_not_found',
        DELETE_SUCCESS: 'tournament_delete_success',
        NEW_SUCCESS: 'tournament_new_success',
        PARTICIPANTS_LIMIT: 'tournament_participants_limit',
        PARTICIPANT_EXISTS: 'tournament_participant_exists',
        HAS_STARTED: 'tournament_has_started',
        HAS_ENDED: 'tournament_has_ended'
    },
    TEAM: {
        NOT_OWNER: 'team_not_owner',
        NOT_FOUND: 'team_not_found',
        DELETE_SUCCESS: 'team_delete_success',
        NEW_SUCCESS: 'team_new_success',
        TAG_TAKEN: 'team_tag_taken'
    },
    USER: {
        NOT_USER: 'user_not_user',
        NOT_FOUND: 'user_not_found',
        DELETE_SUCCESS: 'user_delete_success',
        PASSWORD_SUCCESS: 'user_password_success',
        PASSWORD_WRONG: 'user_password_wrong',
        BANNED: 'user_banned',
        ALREADY_BANNED: 'user_already_banned',
        BAN_SUCCESS: 'user_ban_success',
        BAN_FAIL_ADMIN: 'user_ban_fail_admin',
        NOT_BANNED: 'user_not_banned',
        UNBAN_SUCCESS: 'user_unban_success',
        EDIT_FAIL: 'user_edit_fail',
        XP_SUCCESS: 'user_xp_success',
        XP_FAIL: 'user_xp_fail'
    },
    UPLOAD: {
        SUCCESS: 'upload_success',
        LIMIT_SIZE: 'upload_limit_file_size',
        LIMIT_UNEXPECTED: 'upload_limit_file_unexpected',
        UNKNOWN: 'upload_unknown',
        IMAGES_ONLY: 'upload_images_only'
    }
};
