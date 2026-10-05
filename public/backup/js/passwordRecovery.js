export function resetLocalPassword(users, email, password) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const userIndex = users.findIndex((user) => String(user.email || "").trim().toLowerCase() === normalizedEmail);

  if (userIndex < 0) {
    throw new Error("Không tìm thấy tài khoản này trên trình duyệt hiện tại.");
  }
  if (users[userIndex].role === "admin") {
    throw new Error("Không thể đặt lại mật khẩu tài khoản quản trị trong chế độ demo.");
  }

  const updatedUsers = users.map((user, index) => index === userIndex ? { ...user, password } : user);
  return { updatedUsers, user: updatedUsers[userIndex] };
}
