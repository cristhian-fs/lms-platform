import * as adminRepo from "../repositories/admin";

export async function listUsers(search?: string) {
  return adminRepo.listUsersWithEnrollments(search);
}
