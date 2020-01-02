export default (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    gender: DataTypes.STRING,
    birthDate: DataTypes.DATE,
    preferredLanguage: DataTypes.STRING,
    preferredCurrency: DataTypes.STRING,
    residence: DataTypes.STRING,
    department: DataTypes.STRING,
    lineManager: DataTypes.STRING,
    role: DataTypes.ENUM('super_admin', 'travel_admin', 'travel_team_member', 'manager', 'requester'),
    token: DataTypes.STRING,
    isVerified: DataTypes.BOOLEAN
  }, {});
  Users.associate = () => {
    // associations can be defined here
  };
  return Users;
};
