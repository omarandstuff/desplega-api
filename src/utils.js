import moment from 'moment'

export function filterRemotes(remotes, remotesFilter) {
  if (remotesFilter) {
    return remotes.filter(remote => {
      return remotesFilter.includes(remote.id)
    })
  }
  return remotes
}

export function solveDuration(time) {
  const diference = moment().diff(time)
  const duration = moment.duration(diference)

  if (duration.hours() > 0) {
    return moment(diference).format('hh[:]mm[:]ss[.]SSS')
  } else if (duration.minutes() > 0) {
    return moment(diference).format('mm[:]ss[.]SSS')
  } else {
    return moment(diference).format('ss[.]SSS')
  }
}
