export function findLoadedExternalSkill(eventTrace, installedSkillDirectories) {
  const normalizedTrace = eventTrace.replace(/\\+/g, "/").toLocaleLowerCase("en-US");
  return installedSkillDirectories.find((skillDirectory) =>
    normalizedTrace.includes(skillDirectory.replace(/\\+/g, "/").toLocaleLowerCase("en-US"))
  ) ?? null;
}
