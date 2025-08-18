# Traffic Simulator — Testing

- Manual dispatch: GitHub Actions → Traffic Simulator (either workflow)
- Expected: ~4 min run, logs show periodic activity; monitored job uploads logs artifact
- Local quick test: `timeout 20s node lgfc_enhanced_jwt_traffic_simulator.cjs --interval=2000 --users=3`
