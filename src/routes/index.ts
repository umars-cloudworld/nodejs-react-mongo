export * from './admin';
export * from './avatar';
export * from './email';
export * from './home';
export * from './login';
export * from './logout';
export * from './password';
export * from './register';
export * from './teams';
export * from './tournaments';
export * from './users';

/**
 * @apiDefine any public access
 * Anyone can use this endpoint.
 */

/**
 * @apiDefine guest guest access only
 * Only non-authenticated users can use this endpoint.
 */

/**
 * @apiDefine auth user access only
 * Only authenticated users can use this endpoint.
 */

/**
 * @apiDefine userIdStateExp
 *
 * @apiParam (Body) {String} id user unique identifier.
 * @apiParam (Body) {String} state user request-related unique state/token (64 bytes long).
 * @apiParam (Body) {Date} exp expiration date timestamp.
 */

/**
 * @apiDefine userPasswordAndConfirmation
 *
 * @apiParam (Body) {String} password user password
 * @apiParam (Body) {String} passwordConfirmation password confirmation (must be equal to password)
 */
