import {
  getCapability,
  assertCapabilityLive,
  type CapabilityKey,
  type CapabilityState,
} from "@/config/capabilities";
import { ApiError } from "@/api/response";

type CapabilityCase = {
  key: CapabilityKey;
  state: CapabilityState;
};

const capabilityCases: CapabilityCase[] = [
  { key: "patientProfile", state: "live" },
  { key: "triage", state: "live" },
  { key: "matching", state: "live" },
  { key: "payment", state: "live" },
  { key: "bpjsEligibility", state: "live" },
  { key: "articles", state: "unavailable" },
  { key: "notifications", state: "unavailable" },
  { key: "chatWrite", state: "unavailable" },
  { key: "withdrawal", state: "unavailable" },
  { key: "prescriptions", state: "live" },
  { key: "crisisEscalation", state: "unavailable" },
];

describe("capability registry", () => {
  it.each(capabilityCases)(
    "returns correct state for $key: $state",
    ({ key, state }) => {
      expect(getCapability(key)).toBe(state);
    },
  );

  it("assertCapabilityLive passes for live capabilities and throws ApiError for unavailable", () => {
    expect(() => assertCapabilityLive("payment")).not.toThrow();
    expect(() => assertCapabilityLive("articles")).toThrow(ApiError);
  });
});
