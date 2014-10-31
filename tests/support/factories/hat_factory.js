FactoryGuy.define('hat', {
  default: {},
  small_hat: {
    type: 'SmallHat'
  },
  big_hat: {
    type: 'BigHat'
  },
  traits: {
    belonging_to_user: {
      user: FactoryGuy.belongsTo('user')
    },
    belonging_to_outfit: {
      outfit: FactoryGuy.belongsTo('outfit')
    }
  }
})