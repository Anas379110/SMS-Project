import { describe, it, expect } from "vitest";
import { hasRole, canAccessStudent } from "@/modules/auth/rbac";

describe("auth/rbac", () => {
  it("hasRole allows a role included in the allowed list", () => {
    expect(hasRole("ADMIN", ["ADMIN", "TEACHER"])).toBe(true);
  });

  it("hasRole denies a role not included in the allowed list", () => {
    expect(hasRole("STUDENT", ["ADMIN", "TEACHER"])).toBe(false);
  });

  it("hasRole denies when role is undefined", () => {
    expect(hasRole(undefined, ["ADMIN"])).toBe(false);
  });

  it("canAccessStudent: Admin can access any student", () => {
    expect(
      canAccessStudent({
        requesterRole: "ADMIN",
        requesterUserId: "u1",
        studentGuardianUserId: "someone-else",
      })
    ).toBe(true);
  });

  it("canAccessStudent: Parent can access only their own child (critical security case)", () => {
    expect(
      canAccessStudent({
        requesterRole: "PARENT",
        requesterUserId: "parent-1",
        studentGuardianUserId: "parent-1",
      })
    ).toBe(true);

    expect(
      canAccessStudent({
        requesterRole: "PARENT",
        requesterUserId: "parent-1",
        studentGuardianUserId: "parent-2",
      })
    ).toBe(false);
  });

  it("canAccessStudent: Teacher only if actually assigned to that student", () => {
    expect(
      canAccessStudent({
        requesterRole: "TEACHER",
        requesterUserId: "t1",
        studentGuardianUserId: "p1",
        isTeacherOfStudent: false,
      })
    ).toBe(false);

    expect(
      canAccessStudent({
        requesterRole: "TEACHER",
        requesterUserId: "t1",
        studentGuardianUserId: "p1",
        isTeacherOfStudent: true,
      })
    ).toBe(true);
  });

  it("canAccessStudent: Student can access only their own record, never another student's", () => {
    expect(
      canAccessStudent({
        requesterRole: "STUDENT",
        requesterUserId: "student-1",
        studentGuardianUserId: null,
        studentOwnUserId: "student-1",
      })
    ).toBe(true);

    expect(
      canAccessStudent({
        requesterRole: "STUDENT",
        requesterUserId: "student-1",
        studentGuardianUserId: null,
        studentOwnUserId: "student-2",
      })
    ).toBe(false);
  });
});
