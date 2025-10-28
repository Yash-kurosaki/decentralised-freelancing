import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum JobStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  AUTO_RELEASED = 'AUTO_RELEASED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

interface JobAttributes {
  id: number;
  jobId: string; // Unique job identifier
  clientId: number;
  freelancerId?: number;
  title: string;
  description: string;
  requirements?: string;
  budget: number; // In lamports
  deadline: Date;
  status: JobStatus;
  submissionUrl?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  escrowAddress?: string; // Solana PDA address
  transactionSignature?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobCreationAttributes extends Optional<JobAttributes, 'id' | 'status'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public jobId!: string;
  public clientId!: number;
  public freelancerId?: number;
  public title!: string;
  public description!: string;
  public requirements?: string;
  public budget!: number;
  public deadline!: Date;
  public status!: JobStatus;
  public submissionUrl?: string;
  public submittedAt?: Date;
  public reviewedAt?: Date;
  public rejectionReason?: string;
  public escrowAddress?: string;
  public transactionSignature?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budget: {
      type: DataTypes.BIGINT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JobStatus)),
      defaultValue: JobStatus.OPEN,
    },
    submissionUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    escrowAddress: {
      type: DataTypes.STRING(44),
      allowNull: true,
    },
    transactionSignature: {
      type: DataTypes.STRING(88),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'jobs',
    timestamps: true,
  }
);

export default Job;