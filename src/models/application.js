module.exports = (sequelize, DataType) => {
    return sequelize.define('application', {
        user_id: {
            type: DataType.STRING,
            primaryKey: true,
            unique: true,
        },
        data:  {
            type: DataType.JSON,
            allowNull: false,
            defaultValue: {},
        }
    }, {
        timestamps: true,
    })
}