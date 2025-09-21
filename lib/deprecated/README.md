# Deprecated Files

This directory contains files that are no longer used in the separate services architecture.

## Files Moved Here:

- `global-timer-service-prod.ts` - Replaced by dedicated timer service
- `solana-monitor.ts` - Replaced by dedicated Solana monitor service  
- `solana-webhook-monitor.ts` - Replaced by dedicated Solana monitor service
- `server-webhook-init.ts` - No longer needed with separate services

## Why These Files Are Deprecated:

With the new separate services architecture, the heavy background processing has been moved out of Vercel into dedicated services:

1. **Timer Service** (`services/timer-service/`) - Handles all timer logic and Redis operations
2. **Solana Monitor Service** (`services/solana-monitor-service/`) - Handles blockchain monitoring

This significantly reduces Vercel resource usage while maintaining all functionality.

## Migration Notes:

- The Vercel frontend now proxies requests to the dedicated services
- All timer and monitoring logic has been moved to the dedicated services
- The frontend components have been updated to work with the new architecture

## When to Remove:

These files can be safely removed after:
1. The separate services are deployed and tested
2. All functionality is verified to work correctly
3. The team is confident in the new architecture

## Rollback Plan:

If you need to rollback to the monolithic architecture:
1. Move these files back to the `lib/` directory
2. Revert the changes to `contexts/TimerContext.tsx` and `components/VaultTimer.tsx`
3. Update the API routes to use the original services
4. Remove the separate services deployment
