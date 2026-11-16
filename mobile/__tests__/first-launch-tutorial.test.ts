import { secureStorage } from "@/utils/storage";
import {
  completeFirstLaunchTutorial,
  shouldShowFirstLaunchTutorial,
} from "@/utils/tutorial";

describe("First launch tutorial", () => {
  it("shows the tour when the device has no completion marker", async () => {
    jest.spyOn(secureStorage, "getItem").mockResolvedValue(null);
    expect(await shouldShowFirstLaunchTutorial()).toBe(true);
  });

  it("is skippable, persists completion once, and stays skipped on this session", async () => {
    const spy = jest.spyOn(secureStorage, "setItem").mockResolvedValue(undefined);
    await completeFirstLaunchTutorial();
    expect(spy).toHaveBeenCalledWith("seraphany_tutorial_v1_seen", "1");
    expect(await shouldShowFirstLaunchTutorial()).toBe(false);
    spy.mockRestore();
  });
});
