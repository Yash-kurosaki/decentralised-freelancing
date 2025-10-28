import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  walletAddress: string;
  username?: string;
  bio?: string;
  email?: string;
  githubUsername?: string;
  githubAccessToken?: string;
  reputationScore: number;
  profileImage?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'reputationScore' | 'isActive'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public walletAddress!: string;
  public username?: string;
  public bio?: string;
  public email?: string;
  public githubUsername?: string;
  public githubAccessToken?: string;
  public reputationScore!: number;
  public profileImage?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    walletAddress: {
      type: DataTypes.STRING(44),
      allowNull: false,
      unique: true,
      validate: {
        len: [32, 44]
      }
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    githubUsername: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    githubAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reputationScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 1000
      }
    },
    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;