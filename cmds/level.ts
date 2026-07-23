function canLevelUp(level, exp, multiplier = 1) {
  const required = Math.floor(Math.pow(level + 1, 2) * 100 * multiplier)
  return exp >= required
}

export default async (m) => {
  const user = await getUser(m.sender)

  let before = user.level
  while (canLevelUp(user.level, user.exp, global.multiplier)) {
    user.level++

   await updateUser(m.sender, 'level', user.level)
  }
};