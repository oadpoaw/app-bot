const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('applications', {
        app_type: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        applicants: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
        },
    }, {
        timestamps: false,
    });
}