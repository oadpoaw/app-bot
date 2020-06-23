module.exports = (sequelize, DataType) => {
    return sequelize.define('applications', {
        app_type: {
            type: DataType.STRING,
            primaryKey: true,
            unique: true,
        },
        applicants: {
            type: DataType.JSON,
            allowNull: false,
            defaultValue: [],
        },
    }, {
        timestamps: false,
    });
}