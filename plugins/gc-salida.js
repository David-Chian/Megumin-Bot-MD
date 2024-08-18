setInterval(() => {
  let userRents = global.db.data.userRents;

  for (let user in userRents) {
    let rentData = userRents[user];

    rentData.groups.forEach(group => {
      let groupData = global.db.data.groupRents[group];

      if (groupData && Date.now() >= groupData.startTime + groupData.duration) {

        conn.groupLeave(group);
        delete global.db.data.groupRents[group];
        conn.reply(user, `⚠️ Tu token ha expirado y el bot ha salido del grupo ${group}.`, null);
      }
    });
  }
}, 1000 * 60 * 10); // 10m