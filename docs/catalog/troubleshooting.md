---
sidebar_position: 20
---

# Troubleshooting

This page describes common issues and gotchas during development/deployment of new microservices, and offers solution tips.

### Failed to verify certificate: x509: certificate signed by unknown authority

If you get a TLS x509 error and your application can't reach endpoints of external providers (APIs or CDNs of social media platforms such as Faceook, Instagram, Apple, etc), it might be because:

- **your pod does not have Navarcos certificates mounted**
  > Mount a volume at /etc/navarcos/certs in your pod K8 configuration
- **those domains gets blocked by the firewall**
  > Contact supportccoe@activadigital.it and ask to whitelist those domains in all clusters: chorally-dev, chorally-stage, chorally-prod, aks-sogei

