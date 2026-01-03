function canLevelUp(level, exp, multiplier = 1) {
  const required = Math.floor(Math.pow(level + 1, 2) * 100 * multiplier)
  return exp >= required
}

export default async (m) => {
  const user = global.db.data.users

  let before = user[m.sender].level
  while (canLevelUp(user[m.sender].level, user[m.sender].exp, global.multiplier)) {
    user[m.sender].level++
  }
};