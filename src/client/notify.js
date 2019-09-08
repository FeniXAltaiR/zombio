const notification = document.querySelector('.notification')

export const updateNotify = me => {
  const {notify} = me
  notification.innerHTML = notify.msg
}

export const setNotifyHidden = hidden => {
  if (hidden) {
    // notification.classList.add('hidden');
    notification.style.top = '-100px'
  } else {
    // notification.classList.remove('hidden');
    notification.style.top = '10px'
  }
}