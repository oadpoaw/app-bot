module.exports = (sequelize, DataType) => {
    return sequelize.define('unbans', {
        user_id: {
            type: DataType.STRING,
            unique: true,
            primaryKey: true,
        },
        data: {
            type: DataType.JSON,
            allowNull: false,
            defaultValue: {},
        },
    }, {
        timestamps: false,
    });
}