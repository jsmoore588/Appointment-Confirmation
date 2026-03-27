export function getFollowUpCopy(openedCount: number) {
  if (openedCount >= 2) {
    return {
      headline: "You have looked this over a few times. We will keep things moving when you arrive.",
      support: "High intent detected. Your advisor should prioritize a direct follow-up.",
      badge: "Return visit trigger"
    };
  }

  if (openedCount === 1) {
    return {
      headline: "Your visit is already in motion.",
      support: "Since you’ve opened this page, the best follow-up is a softer reminder rather than a hard close.",
      badge: "Open detected"
    };
  }

  return {
    headline: "We’ve reserved this time specifically for you.",
    support: "If they still have not opened the link, resend it with a direct reason to reply and confirm availability.",
    badge: "Pending open"
  };
}
