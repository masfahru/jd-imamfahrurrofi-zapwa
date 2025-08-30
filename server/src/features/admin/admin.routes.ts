import { OpenAPIHono } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import type { AdminEnv } from '@server/core/middleware/auth.middleware';
import {
  getAdmins,
  setUserRole,
  getUsers,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  changeAdminPassword,
} from '@server/features/admin/admin.service';
import {
  getAdminsRoute,
  setUserRoleRoute,
  getUsersRoute,
  addAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  changePasswordRoute,
} from './admin.openapi';
import { jsonResponse } from '@server/core/utils/response';
import {
  createAndAssignLicense,
  getLicenses, migrateLicenseData, reassignLicense,
  removeLicenseFromUser
} from "@server/features/admin/license/license.service";
import {
  assignLicenseRoute,
  getLicensesRoute, migrateLicenseDataRoute,
  reassignLicenseRoute,
  removeLicenseRoute
} from "@server/features/admin/license/license.openapi";

const app = new OpenAPIHono<AdminEnv>();

app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  scheme: 'bearer',
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status as never);
  }
  return c.json({ message: 'Internal server error' }, 500);
});

app.openapi(addAdminRoute, async (c) => {
  const { name, email, password, role } = c.req.valid('json');

  const newUser = await addAdmin(name, email, password, role);

  return jsonResponse(c, 'Admin user created successfully', newUser, 201);
});

app.openapi(getAdminsRoute, async (c) => {
  const { page, limit, search } = c.req.valid('query');
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const admins = await getAdmins(pageNumber, limitNumber, search);

  return jsonResponse(c, 'Admins retrieved successfully', admins, 200);
});

app.openapi(getUsersRoute, async (c) => {
  const { page, limit, search } = c.req.valid('query');
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const users = await getUsers(pageNumber, limitNumber, search);

  return jsonResponse(c, 'Users retrieved successfully', users, 200);
});

app.openapi(setUserRoleRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { role } = c.req.valid('json');

  const updatedUser = await setUserRole(id, role);

  return jsonResponse(c, 'User role updated successfully', updatedUser, 200);
});

app.openapi(updateAdminRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { name, email } = c.req.valid('json');

  const updatedAdmin = await updateAdmin(id, name, email);
  if (!updatedAdmin) {
    throw new HTTPException(404, { message: 'Admin not found' });
  }

  return jsonResponse(c, 'Admin updated successfully', updatedAdmin, 200);
});

app.openapi(deleteAdminRoute, async (c) => {
  const { id } = c.req.valid('param');

  const result = await deleteAdmin(id);
  if (!result) {
    throw new HTTPException(404, { message: 'Admin not found' });
  }

  return jsonResponse(c, 'Admin deleted successfully', result, 200);
});

app.openapi(changePasswordRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { password } = c.req.valid('json');
  const currentUser = c.get('user');

  const result = await changeAdminPassword(id, password, currentUser.id);

  return jsonResponse(c, 'Password updated successfully', result, 200);
});

app.openapi(getLicensesRoute, async (c) => {
  const { page, limit } = c.req.valid('query');

  const result = await getLicenses(parseInt(page), parseInt(limit));

  return jsonResponse(c, 'Licenses retrieved successfully', result, 200);
});

app.openapi(assignLicenseRoute, async (c) => {
  const { userId } = c.req.valid('param');

  const newLicense = await createAndAssignLicense(userId);

  return jsonResponse(c, 'License assigned successfully', newLicense, 201);
});

app.openapi(removeLicenseRoute, async (c) => {
  const { userId } = c.req.valid('param');

  const result = await removeLicenseFromUser(userId);

  return jsonResponse(c, result.message, null, 200);
});

app.openapi(reassignLicenseRoute, async (c) => {
  const { licenseId, newUserId } = c.req.valid('json');

  const updatedLicense = await reassignLicense(licenseId, newUserId);

  return jsonResponse(c, 'License reassigned successfully', updatedLicense, 200);
});

app.openapi(migrateLicenseDataRoute, async (c) => {
  const { sourceLicenseId, targetLicenseId } = c.req.valid('json');
  const result = await migrateLicenseData(sourceLicenseId, targetLicenseId);
  return jsonResponse(c, result.message, null, 200);
});

export default app;
