FactoryGuy.define('hat', {
  default: {},
  small_hat: {
    type: 'SmallHat'
  },
  big_hat: {
    type: 'BigHat'
  },
  traits: {
    with_user: { user: {} },
    belonging_to_user: { user: {} },
    with_outfit: { outfit: {} },
    belonging_to_outfit: { outfit: {} }
  }
})