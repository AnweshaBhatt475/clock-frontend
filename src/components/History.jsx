import React, { useEffect, useState } from "react";
import { Card, Table, Typography } from "antd";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";

const { Title, Text } = Typography;

export default function History({ apiUrl }) {
  const [rows, setRows] = useState([]);
  const { getIdTokenClaims } = useAuth0();

  useEffect(() => {
    async function load() {
      const claims = await getIdTokenClaims();
      const token = claims.__raw;
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      try {
        const res = await axios.get(apiUrl + "/api/my/entries", { headers });
        setRows(
          res.data.map((r) => ({
            ...r,
            key: r._id,
            ts2: new Date(r.ts).toLocaleString(),
          }))
        );
      } catch (e) {
        console.warn(e);
      }
    }
    load();
  }, [apiUrl]);

  const cols = [
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Time", dataIndex: "ts2", key: "ts2" },
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
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 900,
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
            📜 My Clock History
          </Title>
        }
      >
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Review your past clock-in and clock-out activity below.
        </Text>

        <Table
          dataSource={rows}
          columns={cols}
          pagination={{ pageSize: 8 }}
          bordered
        />
      </Card>
    </div>
  );
}
