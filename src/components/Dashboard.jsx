import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Form,
  InputNumber,
  Button,
  message,
  Typography,
  Divider,
} from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Title, Text } = Typography;

export default function Dashboard({ apiUrl, demo }) {
  const [clocked, setClocked] = useState([]);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({});
  const [form] = Form.useForm();
  const { getIdTokenClaims } = useAuth0();

  useEffect(() => {
    loadAll();
    loadSettings();
  }, []);

  async function loadAll() {
    const claims = await getIdTokenClaims();
    const token = claims.__raw;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const [cRes, eRes, sRes] = await Promise.all([
        axios.get(apiUrl + "/api/clocked-in", { headers }),
        axios.get(apiUrl + "/api/entries", { headers }),
        axios.get(apiUrl + "/api/stats", { headers }),
      ]);
      setClocked(cRes.data);
      setEntries(eRes.data);
      setStats(sRes.data);
    } catch (e) {
      console.warn(e);
    }
  }

  async function loadSettings() {
    const claims = await getIdTokenClaims();
    const token = claims.__raw;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    try {
      const r = await axios.get(apiUrl + "/api/settings", { headers });
      form.setFieldsValue(r.data);
    } catch (e) {}
  }

  async function saveSettings(vals) {
    try {
      await axios.post(apiUrl + "/api/settings", vals);
      message.success("Settings saved");
      loadSettings();
    } catch (e) {
      message.error("Failed to save");
    }
  }

  const cols = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "In Time",
      dataIndex: "in_ts",
      key: "in_ts",
      render: (v) => new Date(v).toLocaleString(),
    },
    { title: "Lat", dataIndex: "lat", key: "lat" },
    { title: "Lng", dataIndex: "lng", key: "lng" },
    { title: "Note", dataIndex: "note", key: "note" },
  ];

  const entryCols = [
    { title: "User", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Time",
      dataIndex: "ts",
      key: "ts",
      render: (v) => new Date(v).toLocaleString(),
    },
    { title: "Lat", dataIndex: "lat", key: "lat" },
    { title: "Lng", dataIndex: "lng", key: "lng" },
    { title: "Note", dataIndex: "note", key: "note" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f9f9f9, #e6f7ff)",
        padding: "30px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Card
          style={{
            marginBottom: 20,
            borderRadius: "16px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          headStyle={{
            background: "#1890ff",
            color: "white",
            borderRadius: "16px 16px 0 0",
          }}
          title={
            <Title level={3} style={{ color: "white", margin: 0 }}>
              📊 Manager Dashboard
            </Title>
          }
        >
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Text strong style={{ fontSize: "16px" }}>
              Team Statistics
            </Text>
          </div>
          <Divider />
          <p>
            <Text strong>📈 Avg hours per day:</Text>
          </p>
          <pre
            style={{
              background: "#f6f9fc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {JSON.stringify(stats.avgHoursPerDay, null, 2)}
          </pre>

          <p>
            <Text strong>👥 Number of people clocking in per day:</Text>
          </p>
          <pre
            style={{
              background: "#f6f9fc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {JSON.stringify(stats.numPerDay, null, 2)}
          </pre>

          <p>
            <Text strong>⏰ Total hours per staff (last 7 days):</Text>
          </p>
          <pre
            style={{
              background: "#f6f9fc",
              padding: "10px",
              borderRadius: "8px",
            }}
          >
            {JSON.stringify(stats.totalPerStaff, null, 2)}
          </pre>
        </Card>

        <Card
          style={{
            marginBottom: 20,
            borderRadius: "16px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          title={
            <Title level={4} style={{ margin: 0 }}>
              🛠️ Perimeter Settings
            </Title>
          }
        >
          <Form
            form={form}
            layout="inline"
            onFinish={saveSettings}
            style={{ gap: "12px", flexWrap: "wrap" }}
          >
            <Form.Item name="centerLat" label="Center Lat">
              <InputNumber style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="centerLng" label="Center Lng">
              <InputNumber style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="radius" label="Radius (m)">
              <InputNumber style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ borderRadius: 8, padding: "6px 20px" }}
              >
                Save
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card
          style={{
            marginBottom: 20,
            borderRadius: "16px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          title={
            <Title level={4} style={{ margin: 0 }}>
              ✅ Currently Clocked In
            </Title>
          }
        >
          <Table
            dataSource={clocked.map((r) => ({ ...r, key: r.userId }))}
            columns={cols}
            pagination={{ pageSize: 5 }}
            bordered
          />
        </Card>

        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
          title={
            <Title level={4} style={{ margin: 0 }}>
              🕒 Recent Entries
            </Title>
          }
        >
          <Table
            dataSource={entries.map((r) => ({ ...r, key: r._id }))}
            columns={entryCols}
            pagination={{ pageSize: 7 }}
            bordered
          />
        </Card>
      </div>
    </div>
  );
}
