import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Radio, Typography } from "antd";
import {
  ClockCircleOutlined,
  HistoryOutlined,
  DashboardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import ClockPanel from "./components/ClockPanel";
import History from "./components/History";
import Dashboard from "./components/Dashboard";
import { useAuth0 } from "@auth0/auth0-react";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

export default function App({ apiUrl, demo }) {
  const { loginWithRedirect, logout, isAuthenticated, user, getIdTokenClaims } =
    useAuth0();
  const [page, setPage] = useState("clock");
  const [roles, setRoles] = useState([]);
  const [demoRole, setDemoRole] = useState("Manager");

  useEffect(() => {
    (async () => {
      if (demo) {
        setRoles([demoRole]);
        return;
      }
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        const roles = claims["https://localhost:5173/roles"] || [];
        const ns = "https://dev-w3hl3rvk8n4bl11v.us.auth0.com/api/v2/";
        const r = (claims && (claims[ns + "Manager"] || roles)) || [];
        setRoles(r);
      } else setRoles([]);
    })();
  }, [isAuthenticated, user, demo, demoRole, getIdTokenClaims]);

  const isManager = roles.includes("Manager");
  const isCare = roles.includes("careworker") || roles.includes("care");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar Navigation */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: "#001f3f", // navy blue
        }}
      >
        <div
          style={{
            color: "white",
            padding: 24,
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            background: "#001737", // slightly darker navy for header
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          ⏱ Clock-in App
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[page]}
          onClick={(e) => setPage(e.key)}
          style={{ background: "#001f3f" }}
        >
          <Menu.Item
            key="clock"
            icon={<ClockCircleOutlined />}
            disabled={!isAuthenticated || (!isManager && !isCare)}
          >
            Clock In / Out
          </Menu.Item>
          <Menu.Item
            key="history"
            icon={<HistoryOutlined />}
            disabled={!isAuthenticated}
          >
            My History
          </Menu.Item>
          <Menu.Item
            key="dashboard"
            icon={<DashboardOutlined />}
            disabled={!isManager}
          >
            Manager Dashboard
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {isAuthenticated ? (
              <span
                style={{
                  marginRight: 16,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 16,
                }}
              >
                <UserOutlined style={{ marginRight: 6, color: "#001f3f" }} />
                Hi, {user?.name || user?.nickname || user?.email}
              </span>
            ) : null}
            {demo ? (
              <span style={{ marginLeft: 12 }}>
                Demo role:
                <Radio.Group
                  value={demoRole}
                  onChange={(e) => setDemoRole(e.target.value)}
                  style={{ marginLeft: 8 }}
                  buttonStyle="solid"
                >
                  <Radio.Button value="Manager">Manager</Radio.Button>
                  <Radio.Button value="careworker">Careworker</Radio.Button>
                </Radio.Group>
              </span>
            ) : null}
          </div>

          <div>
            {isAuthenticated ? (
              <Button
                onClick={() =>
                  logout({ returnTo: window.location.origin })
                }
              >
                Logout
              </Button>
            ) : (
              <Button type="primary" onClick={() => loginWithRedirect()}>
                Log in
              </Button>
            )}
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          {page === "clock" && (
            <ClockPanel apiUrl={apiUrl} demo={demo} demoRole={demoRole} />
          )}
          {page === "history" && (
            <History apiUrl={apiUrl} demo={demo} demoRole={demoRole} />
          )}
          {page === "dashboard" && (
            <Dashboard apiUrl={apiUrl} demo={demo} demoRole={demoRole} />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
