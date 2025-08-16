import React, { useState, useEffect } from "react";
import { Card, Button, Input, message, Typography, Divider, Tag } from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Title, Text } = Typography;

function distMeters(lat1, lon1, lat2, lon2) {
  function toRad(v) {
    return (v * Math.PI) / 180;
  }
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export default function ClockPanel({ apiUrl, demo }) {
  const { isAuthenticated, getIdTokenClaims } = useAuth0();
  const [status, setStatus] = useState("out");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [settings, setSettings] = useState({
    centerLat: 28.6139,
    centerLng: 77.209,
    radius: 100000,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (err) => console.warn("geolocation err", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(id);
    }
  }, []);

  useEffect(() => {
    if (demo) fetchSettings();
  }, [demo]);

  async function fetchSettings() {
    try {
      const r = await axios.get(apiUrl + "/api/settings");
      setSettings(r.data);
    } catch (e) {}
  }

  const canClockIn =
    location.lat !== null &&
    distMeters(location.lat, location.lng, settings.centerLat, settings.centerLng) <=
      settings.radius;

  async function doClock(type) {
    try {
      if (type === "in" && !canClockIn) {
        message.error("🚫 You are outside the perimeter and cannot clock in.");
        return;
      }
      const claims = await getIdTokenClaims();
      const token = claims.__raw;
      const endpoint = type === "in" ? "/api/clock/in" : "/api/clock/out";
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        apiUrl + endpoint,
        { lat: location.lat, lng: location.lng, note },
        { headers }
      );

      message.success(`Clock ${type === "in" ? "in ✅" : "out ⛔"} recorded`);
      setNote("");
      setStatus(type);
    } catch (e) {
      console.error(e);
      message.error("❌ Failed to record");
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <Card
        style={{
          width: "100%",
          maxWidth: 600,
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
        title={<Title level={3} style={{ margin: 0 }}>⏰ Clock In / Out</Title>}
      >
        <div style={{ marginBottom: 20, textAlign: "center" }}>
          {location.lat ? (
            <Tag color={canClockIn ? "green" : "red"} style={{ fontSize: 14 }}>
              {canClockIn ? "Inside Perimeter ✅" : "Outside Perimeter 🚫"}
            </Tag>
          ) : (
            <Text type="secondary">📍 Waiting for geolocation...</Text>
          )}
          <Divider />
          <Text type="secondary">
            Center: {settings.centerLat}, {settings.centerLng} <br />
            Radius: {settings.radius} meters
          </Text>
        </div>

        <Input.TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="📝 Add an optional note..."
          rows={3}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />

        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <Button
            type="primary"
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => doClock("in")}
            disabled={status === "in"}
          >
            ✅ Clock In
          </Button>
          <Button
            danger
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => doClock("out")}
            disabled={status !== "in"}
          >
            ⛔ Clock Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
