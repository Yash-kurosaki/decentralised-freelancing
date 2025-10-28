import User from './User';
import Job from './job';

// Define associations
User.hasMany(Job, { foreignKey: 'clientId', as: 'clientJobs' });
User.hasMany(Job, { foreignKey: 'freelancerId', as: 'freelancerJobs' });

Job.belongsTo(User, { foreignKey: 'clientId', as: 'client' });
Job.belongsTo(User, { foreignKey: 'freelancerId', as: 'freelancer' });

export { User, Job };