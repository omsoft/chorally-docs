import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

// 🔧 Define your services here (you can easily add/remove)
const services = [
  { label: 'Account Service', url: 'https://api.{ENV}.chorally.com/account/health' },
  { label: 'AddressBook Service', url: 'https://api.{ENV}.chorally.com/addressbook/api/health' },
  { label: 'AI Configuration Service', url: 'https://api.{ENV}.chorally.com/ai-toolbox-service/health' },
  { label: 'AI Chatbot Service', url: 'https://api.{ENV}.chorally.com/chatbotai/health' },
  { label: 'AI Toolbox Service', url: 'https://api.{ENV}.chorally.com/aitoolbox/health' },
  { label: 'Apple Service', url: 'https://api.{ENV}.chorally.com/apple/health' },
  { label: 'Author Service', url: 'https://api.{ENV}.chorally.com/author/health' },
  { label: 'Embeddedchat Service', url: 'https://api.{ENV}.chorally.com/embeddedchat/health' },
  { label: 'Escalation Service', url: 'https://api.{ENV}.chorally.com/escalation/health' },
  { label: 'Export Service', url: 'https://api.{ENV}.chorally.com/export/health' },
  { label: 'GoogleMyBusiness Service', url: 'https://api.{ENV}.chorally.com/googlemybusiness/health' },
  { label: 'GooglePlay Service', url: 'https://api.{ENV}.chorally.com/googleplay/health' },
  { label: 'Linkedin Service', url: 'https://api.{ENV}.chorally.com/linkedin/health' },
  { label: 'Log Service', url: 'https://api.{ENV}.chorally.com/log/health' },
  { label: 'Mail Service', url: 'https://api.{ENV}.chorally.com/mail/health' },
  { label: 'Mail Connector Service', url: 'https://api.{ENV}.chorally.com/mailconnector/health' },
  { label: 'Message Service', url: 'https://api.{ENV}.chorally.com/message/health' },
  { label: 'Meta Service', url: 'https://api.{ENV}.chorally.com/meta/health' },
  { label: 'Metadata Service', url: 'https://api.{ENV}.chorally.com/metadata/health' },
  { label: 'Monitoring Service', url: 'https://api.{ENV}.chorally.com/monitoring/health' },
  { label: 'Notification Service', url: 'https://api.{ENV}.chorally.com/notification/health' },
  { label: 'Outbound Service', url: 'https://api.{ENV}.chorally.com/outbound-service/health' },
  { label: 'Package Service', url: 'https://api.{ENV}.chorally.com/package/health' },
  { label: 'Provision Service', url: 'https://api.{ENV}.chorally.com/provision/health' },
  { label: 'Publishing Service', url: 'https://api.{ENV}.chorally.com/publishing/health' },
  { label: 'RulesEngine Service', url: 'https://api.{ENV}.chorally.com/rule-engine/health' },
  { label: 'Rule/Responders Service', url: 'https://api.{ENV}.chorally.com/rule/health' },
  { label: 'Search Service', url: 'https://api.{ENV}.chorally.com/search/health' },
  { label: 'Supersetconnector Service', url: 'https://api.{ENV}.chorally.com/superset-connector/health' },
  { label: 'TicketHelper Service', url: 'https://api.{ENV}.chorally.com/ticket-helper/health' },
  { label: 'TwitterX Service', url: 'https://api.{ENV}.chorally.com/twitter-x/health' },
  { label: 'User Service', url: 'https://api.{ENV}.chorally.com/user/health' },
  { label: 'Youtube Service', url: 'https://api.{ENV}.chorally.com/youtube/health' },
];

// Does a health check with a simple GET request. It expects JSON { status: "OK" }
async function healthCheck(url, env) {
  const finalUrl = url.replace('{ENV}', env);
  console.log(`Checking health for ${finalUrl}`);
  try {
    const response = await fetch(finalUrl, { method: 'GET' });
    if (!response.ok) return false;

    const data = await response.json().catch(() => null);
    if (!data || typeof data.status !== 'string') return false;

    return data.status.trim().toUpperCase() === 'OK';
  } catch (error) {
    return false;
  }
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            View Documentation
          </Link>
          &nbsp;
          <Link
            className="button button--secondary button--lg"
            to="https://gitlab.navarcos.ccoe-nc.com/chorally/easy-chorally">
            Gitlab repository
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const [healthStatus, setHealthStatus] = useState({});
  const [env, setEnv] = useState('dev');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAll() {
      setLoading(true);
      const results = {};
      for (const service of services) {
        const ok = await healthCheck(service.url, env);
        results[service.label] = ok;
      }
      setHealthStatus(results);
      setLoading(false);
    }

    checkAll();
  }, [env]);

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />

      <Heading as="h2" className="text--center" style={{marginTop: '2rem'}}>
        Healthcheck Dashboard
      </Heading>

      <div className="container" style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
          <label htmlFor="env-select" style={{ marginRight: '8px', fontWeight: 600 }}>
            Environment:
          </label>
          <select
            id="env-select"
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="dev">dev</option>
            <option value="stage">stage</option>
            <option value="prod">prod</option>
          </select>
        </div>

        {loading ? (
          <p>Checking services in <b>{env}</b>...</p>
        ) : (
          <p>Service status for environment: <b>{env}</b></p>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Service</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const isHealthy = healthStatus[service.label];
              return (
                <tr key={service.label}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    {service.label}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isHealthy ? 'green' : 'red',
                        marginRight: '8px',
                      }}
                    />
                    {isHealthy ? 'Reachable' : 'Unreachable'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* <main>
        <HomepageFeatures />
      </main> */}
    </Layout>
  );
}
