export type MockUserRole = "농가" | "교육이수자" | "중개 센터";

export type MockRegisteredUser = {
  email: string;
  name: string;
  password: string;
  role: MockUserRole;
};

type PendingRegisterUser = Omit<MockRegisteredUser, "role">;

const PENDING_USER_KEY = "chungbuk-farmer-pending-user";
const MOCK_AUTH_URL = "http://localhost:4000";

export const savePendingRegisterUser = (user: PendingRegisterUser) => {
  window.localStorage.setItem(PENDING_USER_KEY, JSON.stringify(user));
};

export const completePendingRegisterUser = async (role: MockUserRole) => {
  const pendingUser = window.localStorage.getItem(PENDING_USER_KEY);

  if (!pendingUser) {
    throw new Error("pending user not found");
  }

  const parsedUser = JSON.parse(pendingUser) as PendingRegisterUser;
  const registeredUser = { ...parsedUser, role };
  const response = await fetch(`${MOCK_AUTH_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registeredUser),
  });

  if (!response.ok) {
    throw new Error("failed to save user");
  }

  window.localStorage.removeItem(PENDING_USER_KEY);

  return registeredUser;
};

export const loginWithMockUser = async (email: string, password: string) => {
  const response = await fetch(`${MOCK_AUTH_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("invalid credentials");
  }

  return (await response.json()) as MockRegisteredUser;
};

export const hasMockUser = async (email: string) => {
  const response = await fetch(`${MOCK_AUTH_URL}/users`);

  if (!response.ok) {
    throw new Error("failed to read users");
  }

  const users = (await response.json()) as MockRegisteredUser[];

  return users.some((user) => user.email === email);
};

export const deleteMockUser = async (email: string) => {
  const response = await fetch(`${MOCK_AUTH_URL}/users`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("failed to delete user");
  }
};
