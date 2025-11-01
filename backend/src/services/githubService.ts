import axios from 'axios';

export interface GitHubProfile {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits: number;
  languages: { [key: string]: number };
  accountAge: number; // in days
}

export class GitHubService {
  private static GITHUB_API = 'https://api.github.com';

  // Get user profile
  static async getUserProfile(username: string): Promise<GitHubProfile> {
    try {
      const response = await axios.get(`${this.GITHUB_API}/users/${username}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add token if available: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub profile fetch error:', error);
      throw new Error('Failed to fetch GitHub profile');
    }
  }

  // Get user repositories
  static async getUserRepos(username: string): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get(
        `${this.GITHUB_API}/users/${username}/repos`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
          params: {
            per_page: 100,
            sort: 'updated'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('GitHub repos fetch error:', error);
      throw new Error('Failed to fetch GitHub repositories');
    }
  }

  // Calculate GitHub statistics
  static async calculateStats(username: string): Promise<GitHubStats> {
    try {
      const profile = await this.getUserProfile(username);
      const repos = await this.getUserRepos(username);

      const stats: GitHubStats = {
        totalRepos: profile.public_repos,
        totalStars: 0,
        totalForks: 0,
        totalCommits: 0,
        languages: {},
        accountAge: this.calculateAccountAge(profile.created_at)
      };

      // Aggregate repo stats
      repos.forEach(repo => {
        stats.totalStars += repo.stargazers_count;
        stats.totalForks += repo.forks_count;
        
        if (repo.language) {
          stats.languages[repo.language] = (stats.languages[repo.language] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('GitHub stats calculation error:', error);
      throw new Error('Failed to calculate GitHub stats');
    }
  }

  // Calculate account age in days
  private static calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Get user contribution activity (requires GraphQL API)
  static async getUserActivity(username: string): Promise<number> {
    try {
      // This would require GitHub GraphQL API
      // For now, return estimated based on repos
      const repos = await this.getUserRepos(username);
      
      // Estimate activity based on recent updates
      const recentActivity = repos.filter(repo => {
        const updated = new Date(repo.updated_at);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return updated > sixMonthsAgo;
      }).length;

      return recentActivity;
    } catch (error) {
      console.error('GitHub activity fetch error:', error);
      return 0;
    }
  }

  // Verify GitHub account ownership (OAuth flow would be needed for production)
  static async verifyOwnership(username: string, walletAddress: string): Promise<boolean> {
    // This is a placeholder - real implementation would use GitHub OAuth
    // For MVP, we can just verify the account exists
    try {
      await this.getUserProfile(username);
      return true;
    } catch (error) {
      return false;
    }
  }
}