/**
 * API Response class
 */

class APIResponse {


    get code() {
        return this._code;
    }

    get message() {
        return this._message;
    }

    get status() {
        return this._status;
    }

    get data() {
        return this._data;
    }


    _code = 0;
    _message = '';
    _status = false;
    _data = {};

    /**
     *
     */
    constructor() {
        this.resetError();
    }

    /**
     *
     * @param data
     */
    setResponse(data) {
        this._code = 200;
        this._message = '';
        this._data = data;
        this._status = true;
    }

    /**
     *
     * @param message
     */
    setError(message) {
        this._code = 400;
        this._message = message;
        this._data = {};
        this._status = false;
    }

    /**
     *
     * @returns {{code: number, data: {}, message: string}}
     */
    getResponseJSON() {
        return {
            code: this._code,
            message: this._message,
            data: this._data,
            status: this._status
        }
    }

    /**
     *
     */
    resetError() {
        this._code = 0;
        this._message = '';
        this._data = {};
        this._status = false;
    }


}

module.exports.APIResponse = APIResponse;