# Harness plugins for [Backstage](https://backstage.io)

![Harness gif](./docs/assets/hero-animation_desktop.gif)

<!-- Add when Repository is Open Source. -->
<!-- ![GitHub](https://img.shields.io/github/license/harness/backstage-plugins?label=License&logo=Apache) -->

[![License Apache](https://img.shields.io/badge/License-Apache%202.0-blue)](https://github.com/harness/backstage-plugins/blob/main/LICENSE.md)
[![Join Slack](https://img.shields.io/badge/Join-Slack-green)](https://join.slack.com/t/harnesscommunity/shared_invite/zt-1k5lupmly-No89okNhRnhBSWQa1o69_Q)

## About

This project consists of Backstage plugins to integrate with [Harness](https://harness.io) modules on the [Backstage Developer Platform](https://backstage.io). If you are a Harness user and have Backstage as your Internal Developer Portal, try out our plugins for a seamless Developer Experience for your developers.

Harness plugins for Backstage is an Open Source project. It's open for your ideas, suggestions and contributions.

## How to use?

Check out the plugin specific installation instructions.

| Harness Module                                                                                                                                                                                                                                                                                         | Description                                            | Documentation                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| [<img align="center" src="./docs/assets/CI%20logo.png" alt="Harness CI logo" width="20" /> CI](https://harness.io/products/continuous-integration) and [<img align="center" src="./docs/assets/CD%20logo.png" alt="Harness CD logo" width="20" /> CD](https://harness.io/products/continuous-delivery) | View builds and pipeline executions for your services. | 📘 [Installation instructions](./plugins/harness-ci-cd/) |
| [<img align="center" src="./docs/assets/Feature%20Flags%20logo.png" alt="Feature flags logo" width="20" /> Feature Flags](https://harness.io/products/feature-flags) | View list of Feature Flags | 📘 [Installation instructions](./plugins/harness-feature-flags/) |
[<img align="center" src="./docs/assets/Chaos%20logo.png" alt="Chaos engineering logo" width="20" /> Chaos Engineering](https://harness.io/products/chaos-engineering) | View list of Chaos Experiments | 📘 [Installation instructions](./plugins/harness-chaos/) |
[<img align="center" src="./docs/assets/SRM%20logo.png" alt="SRM logo" width="20" /> Service Reliability Management](https://www.harness.io/products/service-reliability-management) | Tracks the defined SLOs and Error Budgets | 📘 [Installation instructions](./plugins/harness-srm/) |
[<img align="center" src="./docs/assets/iac-logo.png" alt="IACM logo" width="20" /> Infrastructure as Code Management](https://www.harness.io/products/infrastructure-as-code-management) | Overview of all the resources provisioned | 📘 [Installation instructions](./plugins/harness-iacm/) |


## Contributor License Agreement

In order to clarify the intellectual property license granted with Contributions from any person or entity, Harness Inc. ("Harness") must have a Contributor License Agreement ("CLA") on file that has been read and followed by each contributor, indicating an agreement to the license terms [here](Contributor_License_Agreement.md). This license is for your protection as a Contributor as well as the protection of Harness; it does not change your rights to use your own Contributions for any other purpose.

## Contributing

<!-- Checkout contributing guide -->

Check out our [contributing guide](./docs/Contributing.md) if you would like to contribute suggestions or pull requests.

## Contact

If you would like to chat with us, join the [Harness Community Slack channel](https://join.slack.com/t/harnesscommunity/shared_invite/zt-1k5lupmly-No89okNhRnhBSWQa1o69_Q) and ask a question!

## Roadmap

| Harness Module                                                                                                                                                                                                                                                                                         | Description                                               | Status         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | -------------- |
| [<img align="center" src="./docs/assets/CI%20logo.png" alt="Harness CI logo" width="20" /> CI](https://harness.io/products/continuous-integration) and [<img align="center" src="./docs/assets/CD%20logo.png" alt="Harness CD logo" width="20" /> CD](https://harness.io/products/continuous-delivery) | View builds and pipeline executions for your services.    | ✅ Launched    |
| [<img align="center" src="./docs/assets/Cloud%20Cost%20logo.png" alt="Cloud cost management logo" width="20" /> Cloud Cost Management](https://harness.io/products/cloud-cost)                                                                                                                         | Manage and Optimize cloud costs                           | ⏳ Coming soon |
| [<img align="center" src="./docs/assets/Feature%20Flags%20logo.png" alt="Feature flags logo" width="20" /> Feature Flags](https://harness.io/products/feature-flags)                                                                                                                                   | View list of Feature Flags set in the project.                                       | ✅ Launched |
| [<img align="center" src="./docs/assets/Chaos%20logo.png" alt="Chaos engineering logo" width="20" /> Chaos Engineering](https://harness.io/products/chaos-engineering)                                                                                                                                 | Improve application resiliency and reduce costly downtime  | ✅ Launched |
| [<img align="center" src="./docs/assets/STO%20logo.png" alt="STO logo" width="20" /> Security Testing Orchestration](https://harness.io/products/security-testing-orchestration)                                                                                                                       | Shift-left application security                           | ⏳ Coming soon |
| [<img align="center" src="./docs/assets/SRM%20logo.png" alt="SRM logo" width="20" /> Service Reliability Management](https://harness.io/products/service-reliability-management)                                                                                                                       | SLO-driven software delivery                              | ✅ Launched |
| [<img align="center" src="./docs/assets/SEI%20logo.png" alt="SEI logo" width="20" /> Software Engineering Insights](https://www.harness.io/products/software-engineering-insights)                                                                                                                       | Improve Engineering Results with Data-Driven Decisions delivery                              | ⏳ Coming soon |


## Code of Conduct

All users and contributors of the Harness community should adhere to the following [Code of Conduct](https://github.com/harness/community/blob/main/CODE_OF_CONDUCT.md)!

## Communication

Refer [Harness Community Communications Guide](https://github.com/harness-community/overview/blob/main/community_communication_guide.rst) to interact with the wider community users/contributors, join slack workgroups to get help/help other users and create topics in [community.harness.io](https://community.harness.io/).

## Security

Please report sensitive security issues via [harness.io/security](https://harness.io/security) rather than GitHub.

### License

Apache License 2.0. See [COPYING](LICENSE.md) for more information.

### Issues
 If you encounter an issue with [node gyp](https://www.npmjs.com/package/node-gyp), the following command on mac resolved it for me
 ```
    brew install python-setuptools
```