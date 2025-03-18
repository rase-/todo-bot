import { Agent } from "@mastra/core/agent";
import { DefaultStorage } from "@mastra/core/storage/libsql";

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { execSync } from "child_process";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { DefaultVectorDB } from "@mastra/core/vector/libsql";

// export const weatherInfo = createTool({
//   id: "Get Weather Information",
//   inputSchema: z.object({
//     city: z.string(),
//   }),
//   description: `Fetches the current weather information for a given city`,
//   execute: async ({ context: { city } }) => {
//     console.log("Using tool to fetch weather information for", city);
//     return await getWeather(city);
//   },
// });
const shellTool = createTool({
  id: "execute_shell",
  description: "Execute shell commands",
  inputSchema: z.object({
    command: z.string().describe("Shell command to execute"),
  }),
  execute: async ({ context: { command } }) => {
    console.log(command);
    const stdout = execSync(command);
    return { stdout };
    // const { stdout, stderr } = await exec(command);
    // return { stdout, stderr };
  },
});

interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}
const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = await geocodingResponse.json();

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data: WeatherResponse = await response.json();

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

export const weatherInfo = createTool({
  id: "Get Weather Information",
  inputSchema: z.object({
    city: z.string(),
  }),
  description: `Fetches the current weather information for a given city`,
  execute: async ({ context: { city } }) => {
    console.log("Using tool to fetch weather information for", city);
    return await getWeather(city);
  },
});

// const storage = new DefaultStorage({
//   config: {
//     url: "libsql://c01c3455-3745-4087-a75b-44721ed68b19-mastra.turso.io",
//     authToken:
//       "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzk4MTAwNzAsInAiOnsicnciOnsibnMiOlsiMWIyZjYyMTgtOTI1MS00ZDk3LWIzMDctNzBkMTk3OGIyMjJmIl19fX0.0FqTfjNGPMGk9-Da_0-2cpS8B71uoyMmWnHriQg6ygFJvNNvCgZkKQYJIcrUWG32Df137sf1Knt2qU7uMBj0Bw",
//   },
// });
// await storage.init();

// const vector = new DefaultVectorDB({
//   connectionUrl:
//     "libsql://c01c3455-3745-4087-a75b-44721ed68b19-mastra.turso.io",
//   authToken:
//     "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Mzk4MTAwNzAsInAiOnsicnciOnsibnMiOlsiMWIyZjYyMTgtOTI1MS00ZDk3LWIzMDctNzBkMTk3OGIyMjJmIl19fX0.0FqTfjNGPMGk9-Da_0-2cpS8B71uoyMmWnHriQg6ygFJvNNvCgZkKQYJIcrUWG32Df137sf1Knt2qU7uMBj0Bw",
// });

export const memoryAgent = new Agent({
  name: "Memory Agent",

  instructions: "You are a helpful AI assistant",

  tools: { weatherInfo },

  model: openai("gpt-4o"),
  // memory: new Memory({ storage, vector }),
});
