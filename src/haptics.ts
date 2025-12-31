import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { getSetting } from "./kv";

export async function hapticTap(
  style: ImpactStyle = ImpactStyle.Light
) {
  const enabled = await getSetting("hapticsEnabled", true);
  if (!enabled) return;

  try {
    await Haptics.impact({ style });
  } catch {
    // web / fallback – ignorera
  }
}
