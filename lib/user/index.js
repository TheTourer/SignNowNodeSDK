'use strict';
const https = require('https');
const {
  responseHandler,
  errorHandler,
  buildRequestOptions,
} = require('../common');

/**
 * User methods
 */
class User {

  /**
   * Create User optional settings
   * @typedef {Object} CreateUserOptions
   * @property {boolean} [verifyEmail=false] - if `true` verification email will be sent
   * @property {number} [startTrial=false] - if `true` start 30 days free trial
   */

  /**
   * Create user payload
   * @typedef {Object} UserCreateParams
   * @property {string} email - email of new user
   * @property {string} password - password for new user
   * @property {string} [first_name] - first name of new user
   * @property {string} [last_name] - last name of new user
   * @property {string} [number] - phone number of new user
   * @property {CreateUserOptions} [options] - create user optional settings
   */

  /**
   * Create user response data
   * @typedef {Object} UserCreateResponse
   * @property {string} id - user unique id
   * @property {number} verified - user is verified or not
   * @property {string} email - user email
   */

  /**
   * Create new user account
   * @param {UserCreateParams} data - create user payload
   * @param {function(err: ApiErrorResponse, res: UserCreateResponse)} [originalCallback] - error first node.js callback
   */
  static create ({
    email,
    password,
    first_name,
    last_name,
    number,
    options: {
      verifyEmail = false,
      startTrial = false,
    } = {},
  }, originalCallback) {
    const JSONData = JSON.stringify({
      skip_30day_trial: startTrial ? 0 : 1,
      email,
      password,
      first_name,
      last_name,
      number,
    });

    const callbackWithEmailVerification = (createErr, createRes) => {
      if (createErr) {
        originalCallback(createErr);
        return;
      } else {
        User.verifyEmail({ email }, verifyErr => {
          if (verifyErr) {
            originalCallback(verifyErr);
            return;
          } else {
            originalCallback(null, createRes);
            return;
          }
        });
      }
    };

    const callback = verifyEmail
      ? callbackWithEmailVerification
      : originalCallback;

    const req = https
      .request(buildRequestOptions({
        method: 'POST',
        path: '/user',
        authorization: { type: 'Basic' },
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSONData),
        },
      }), responseHandler(callback))
      .on('error', errorHandler(callback));

    req.write(JSONData);
    req.end();
  }

  /**
   * Get user payload
   * @typedef {Object} UserGetParams
   * @property {string} token - your auth token
   */

  /**
   * Retrieve user response data
   * @typedef {Object} UserGetResponse
   * @property {string} id - user unique id
   * @property {string} first_name - first name
   * @property {string} last_name - last name
   * @property {number} active - user is active or not
   * @property {string} created - user creation timestamp
   * @property {string[]} emails - user emails
   * @property {string} primary_email - user primary email
   * @property {Object[]} subscriptions - user subscriptions data
   * @property {?Object} cloud_export_account_details - cloud export account details data
   * @property {boolean} is_logged_in - user is logged in or not
   * @property {{start_date: string, end_date: string, start_timestamp: number, end_timestamp: number}} billing_period - user billing period data
   * @property {Object[]} companies - companies where user is a member of
   * @property {?string} registration_source - resource where user was registered
   * @property {Object[]} teams - teams where user is a member of
   * @property {Object} settings - user specific settings
   * @property {Object[]} organization_settings - organization specific settings where user is a member of
   * @property {Object[]} merchant_accounts - merchant accounts data
   */

  /**
   * Retrieve user account details
   * @param {UserGetParams} data - get user payload
   * @param {function(err: ApiErrorResponse, res: UserGetResponse)} [callback] - error first node.js callback
   */
  static retrieve ({ token }, callback) {
    https
      .request(buildRequestOptions({
        method: 'GET',
        path: '/user',
        authorization: {
          type: 'Bearer',
          token,
        },
      }), responseHandler(callback))
      .on('error', errorHandler(callback))
      .end();
  }

  /**
   * Verify user email payload
   * @typedef {Object} UserVerifyEmailParams
   * @property {string} email - email to verify
   */

  /**
   * Verify user email response data
   * @typedef {Object} UserVerifyEmailResponse
   * @property {string} status - status of verification email sending, e.g. 'success'
   */

  /**
   * Sends email with verification link to user
   * @param {UserVerifyEmailParams} data - user verify email payload
   * @param {function(err: ApiErrorResponse, res: UserVerifyEmailResponse)} [callback] - error first node.js callback
   */
  static verifyEmail ({ email }, callback) {
    const JSONData = JSON.stringify({ email });
    const req = https
      .request(buildRequestOptions({
        method: 'POST',
        path: '/user/verifyemail',
        authorization: { type: 'Basic' },
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSONData),
        },
      }), responseHandler(callback))
      .on('error', errorHandler(callback));

    req.write(JSONData);
    req.end();
  }


  /**
   * Turn off reusable signatures for user
   * @typedef {Object} DeactivateReusableSignaturesParams
   * @property {string} token - access token for the user
   */

  /**
   * Turn off reusable signatures for user
   * @param {DeactivateReusableSignaturesParams} data - deactivate reusable signatures payload
   * @param {function(err: ApiErrorResponse)} [callback] - error first node.js callback
   */
  static deactivateReusableSignatures({ token }, callback) {
    const JSONData = JSON.stringify({ active: 1 });

    const req = https
      .request(buildRequestOptions({
        method: 'PUT',
        path: '/user/setting/no_user_signature_return',
        authorization: {
          type: 'Bearer',
          token,
        },
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSONData),
        },
      }), responseHandler(callback))
      .on('error', errorHandler(callback))

    req.write(JSONData);
    req.end();
  }
}

module.exports = User;
