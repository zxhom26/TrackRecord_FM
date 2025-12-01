import test from 'node:test';
import assert from 'node:assert/strict';


/*  ----- CALLING BACKEND ---- */
import { callBackend,  
        sendTokenToBackend, 
        fetchTopTracks,
        fetchTopArtists, 
        getTopMoodsFromGenres,
        getQuickStats,
    } from '../utils.js';
import { url } from 'node:inspector';

test("callBackend returns object", () => {
    assert.equal(typeof callBackend(), "object");
});

/*  ----- SENDING TOKEN TO BACKEND ---- */
test("sendTokenToBackend sends request and returns .json"), async () => {
    
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

    const mockFetch = global.fetch;
    global.fetch = async (url, options) => {
        assert.equal(url, "https://mock-backend/api/token");
        assert.equal(options.method, "POST");
        assert.equal(options.headers["Content-Type"], "application/json");

        const body = JSON.parse(options.body);
        assert.equal(body.accessToken, "mocktoken123")

        return {
            ok: true,
            json: async () => ({ success: true, received: body.accessToken}),
        };
    };

    const result = await sendTokenToBackend("mocktoken123");
    
    assert.deepEqual(result, {success: true, received: "mocktoken123"});

    global.fetch = mockFetch;

}


test("sendTokenToBackend error handling", async () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

    const mockFetch = global.fetch;
    global.fetch = async () => ({
        ok: false,
        status: 500,
    });

    const result = await sendTokenToBackend("token");

    assert.equal(result.error, "Backend responded with status 500");

    global.fetch = mockFetch
})


/*  ----- FETCHING TOP TRACKS ---- */
test("fetchTopTracks returns proper tracks"), async () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

    const mockFetch = global.fetch;
    global.fetch = async (url, options) => {
        assert.equal(url, "https://mock-backend/api/token");
        assert.equal(options.method, "POST");
        assert.equal(options.headers["Content-Type"], "application/json");

        const body = JSON.parse(options.body);
        assert.equal(body.accessToken, "mocktoken123")

        return {
            ok: true,
            json: async () => ({ success: true, received: body.accessToken}),
        };
    };

    const result = await sendTokenToBackend("mocktoken123");
    
    assert.deepEqual(result, {success: true, received: "mocktoken123"});

    global.fetch = mockFetch;
}