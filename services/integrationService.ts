
import { IntegrationProvider } from '../types';

/**
 * Mock Service to simulate OAuth flow and API fetching for Garmin/Oura
 */

export const connectProvider = async (provider: IntegrationProvider): Promise<boolean> => {
    // Simulate network delay and OAuth popup
    await new Promise(resolve => setTimeout(resolve, 1500));
    return true; // Always succeeds in demo
};

export const disconnectProvider = async (provider: IntegrationProvider): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
};

export const fetchIntegrationData = async (provider: IntegrationProvider) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate different data profiles based on provider or random variance
    if (provider === 'oura') {
        return {
            sleepHours: 5.8, // Low sleep
            hrv: 28,         // Low HRV
            restingHeartRate: 58,
            readiness: 45
        };
    } else {
        // Garmin simulation
        return {
            sleepHours: 7.5,
            hrv: 45,
            restingHeartRate: 52,
            bodyBattery: 75
        };
    }
};
