# Traffic Simulator — Troubleshooting

- Check Action logs for `Traffic Simulator` or `Traffic Simulator (Monitored)`
- Common: runner timeout, network errors; monitored job restarts the simulator
- Verify Node 20 installs, `npm ci` succeeds
- If failures persist, run locally: `node lgfc_enhanced_jwt_traffic_simulator.cjs --interval=5000 --users=2`
