export const LUA_HEARTBEAT_SCRIPT = `-- ===================================================================
-- LegendTopia GTPS Cloud - Heartbeat Script (Lua)
-- Letakkan script ini pada startup/server script GTPS Cloud kamu
-- ===================================================================

local WEBSITE_URL = "https://legendtopia.vercel.app/api/heartbeat"
local GTPS_SECRET = "193679634487" -- Sesuaikan dengan SECRET_KEY server kamu
local HEARTBEAT_INTERVAL_MS = 30000 -- 30 detik

-- Helper untuk serialize tabel sederhana ke JSON
local function serializeJson(tbl)
    local parts = {}
    for k, v in pairs(tbl) do
        local key = string.format("%q", tostring(k))
        local val
        if type(v) == "table" then
            if #v > 0 then
                local arr = {}
                for _, item in ipairs(v) do
                    if type(item) == "table" then
                        table.insert(arr, serializeJson(item))
                    else
                        table.insert(arr, string.format("%q", tostring(item)))
                    end
                end
                val = "[" .. table.concat(arr, ",") .. "]"
            else
                val = serializeJson(v)
            end
        elseif type(v) == "number" then
            val = tostring(v)
        elseif type(v) == "boolean" then
            val = v and "true" or "false"
        else
            val = string.format("%q", tostring(v))
        end
        table.insert(parts, key .. ":" .. val)
    end
    return "{" .. table.concat(parts, ",") .. "}"
end

-- Function untuk mengumpulkan data server GTPS
local function gatherServerData()
    local playerList = {}
    local onlineCount = 0

    -- Ambil player dari GTPS API (contoh: getPlayers() atau looping GetPlayerList())
    if getPlayers then
        for _, p in ipairs(getPlayers()) do
            onlineCount = onlineCount + 1
            if onlineCount <= 50 then -- batasi max 50 player names agar payload efisien
                local name = p.name or p:getName() or "Player"
                local world = p.world or (p.getWorld and p:getWorld()) or "EXIT"
                table.insert(playerList, {
                    name = name,
                    world = world
                })
            end
        end
    end

    local uptimeStr = "Active"
    if getUpTime then
        local sec = getUpTime()
        local h = math.floor(sec / 3600)
        local m = math.floor((sec % 3600) / 60)
        uptimeStr = string.format("%dh %dm", h, m)
    end

    return {
        secret = GTPS_SECRET,
        serverName = "LegendTopia",
        playerCount = onlineCount,
        maxPlayers = 1000,
        players = playerList,
        worldCount = (getWorlds and #getWorlds()) or 12,
        uptime = uptimeStr,
        version = "4.45"
    }
end

-- Kirim Heartbeat via Async Coroutine
local function sendHeartbeat()
    coroutine.wrap(function()
        local data = gatherServerData()
        local payload = serializeJson(data)
        local headers = {
            ["Content-Type"] = "application/json",
            ["X-Soft-Authenticate-Key"] = GTPS_SECRET,
            ["User-Agent"] = "LegendTopia-GTPS/1.0"
        }

        -- http:post wajib di dalam coroutine (GTPS Cloud non-blocking)
        local body, statusCode = http:post(WEBSITE_URL, headers, payload)

        if statusCode == -1 then
            print("[LegendTopia] Gagal menghubungi server web (HTTP -1)")
        elseif statusCode >= 200 and statusCode < 300 then
            print("[LegendTopia] Heartbeat sukses terkirim ke Vercel! (" .. tostring(statusCode) .. ")")
        else
            print("[LegendTopia] Heartbeat HTTP error: " .. tostring(statusCode) .. " | " .. tostring(body))
        end
    end)()
end

-- Timer Loop Heartbeat setiap 30 Detik
local function startHeartbeatLoop()
    print("[LegendTopia] Service Heartbeat Online dimulai...")
    -- Kirim langsung saat startup
    sendHeartbeat()

    -- Jalankan loop interval
    if addEvent then
        -- Jika engine mendukung addEvent / timer
        addEvent(HEARTBEAT_INTERVAL_MS, true, function()
            sendHeartbeat()
        end)
    else
        -- Fallback thread loop
        coroutine.wrap(function()
            while true do
                sleep(HEARTBEAT_INTERVAL_MS)
                sendHeartbeat()
            end
        end)()
    end
end

-- Start Service
startHeartbeatLoop()
`;
