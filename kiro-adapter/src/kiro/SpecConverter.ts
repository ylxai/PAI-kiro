/**
 * ISA to Kiro Spec Converter
 * 
 * Converts PAI's ISA (Ideal State Artifact) format to Kiro's Spec format
 * and vice versa for bidirectional compatibility.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ISA {
  problem: string;
  vision: string;
  outOfScope: string[];
  principles: string[];
  constraints: string[];
  goal: string;
  criteria: ISC[];
  testStrategy: string;
  features: string[];
  decisions: Decision[];
  changelog: ChangelogEntry[];
  verification: VerificationResult[];
}

export interface ISC {
  id: string;
  description: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  probe?: string;
}

export interface Decision {
  id: string;
  decision: string;
  rationale: string;
  alternatives: string[];
}

export interface ChangelogEntry {
  date: string;
  type: 'conjecture' | 'refutation' | 'learning';
  content: string;
}

export interface VerificationResult {
  criterion: string;
  result: 'PASS' | 'FAIL';
  evidence: string;
}

export interface KiroSpec {
  type: 'feature' | 'bugfix';
  requirements: string;
  design: string;
  tasks: string;
}

export class SpecConverter {
  /**
   * Convert ISA to Kiro Spec format
   */
  async isaToKiroSpec(isa: ISA): Promise<KiroSpec> {
    const requirements = this.generateRequirements(isa);
    const design = this.generateDesign(isa);
    const tasks = this.generateTasks(isa);

    return {
      type: 'feature',
      requirements,
      design,
      tasks,
    };
  }

  /**
   * Convert Kiro Spec to ISA format
   */
  async kiroSpecToISA(spec: KiroSpec): Promise<ISA> {
    // Parse requirements
    const problem = this.extractSection(spec.requirements, 'Problem');
    const goal = this.extractSection(spec.requirements, 'Goal');
    const criteria = this.parseAcceptanceCriteria(spec.requirements);

    // Parse design
    const principles = this.extractList(spec.design, 'Principles');
    const constraints = this.extractList(spec.design, 'Constraints');
    const features = this.extractList(spec.design, 'Features');

    // Parse tasks
    const taskList = this.parseTasks(spec.tasks);

    return {
      problem,
      vision: goal,
      outOfScope: [],
      principles,
      constraints,
      goal,
      criteria,
      testStrategy: this.extractSection(spec.design, 'Test Strategy'),
      features,
      decisions: [],
      changelog: [],
      verification: [],
    };
  }

  /**
   * Generate requirements.md from ISA
   */
  private generateRequirements(isa: ISA): string {
    let content = '# Requirements\n\n';

    // Problem statement
    content += '## Problem\n\n';
    content += `${isa.problem}\n\n`;

    // Goal
    content += '## Goal\n\n';
    content += `${isa.goal}\n\n`;

    // User stories (derived from criteria)
    content += '## User Stories\n\n';
    for (const criterion of isa.criteria) {
      content += `### ${criterion.id}\n\n`;
      content += `${criterion.description}\n\n`;
      content += `**Acceptance Criteria:**\n`;
      content += `- [ ] ${criterion.description}\n\n`;
    }

    // Out of scope
    if (isa.outOfScope.length > 0) {
      content += '## Out of Scope\n\n';
      for (const item of isa.outOfScope) {
        content += `- ${item}\n`;
      }
      content += '\n';
    }

    return content;
  }

  /**
   * Generate design.md from ISA
   */
  private generateDesign(isa: ISA): string {
    let content = '# Design\n\n';

    // Vision
    content += '## Vision\n\n';
    content += `${isa.vision}\n\n`;

    // Principles
    if (isa.principles.length > 0) {
      content += '## Principles\n\n';
      for (const principle of isa.principles) {
        content += `- ${principle}\n`;
      }
      content += '\n';
    }

    // Constraints
    if (isa.constraints.length > 0) {
      content += '## Constraints\n\n';
      for (const constraint of isa.constraints) {
        content += `- ${constraint}\n`;
      }
      content += '\n';
    }

    // Features
    if (isa.features.length > 0) {
      content += '## Features\n\n';
      for (const feature of isa.features) {
        content += `- ${feature}\n`;
      }
      content += '\n';
    }

    // Test Strategy
    content += '## Test Strategy\n\n';
    content += `${isa.testStrategy}\n\n`;

    // Decisions
    if (isa.decisions.length > 0) {
      content += '## Decisions\n\n';
      for (const decision of isa.decisions) {
        content += `### ${decision.id}: ${decision.decision}\n\n`;
        content += `**Rationale:** ${decision.rationale}\n\n`;
        if (decision.alternatives.length > 0) {
          content += `**Alternatives considered:**\n`;
          for (const alt of decision.alternatives) {
            content += `- ${alt}\n`;
          }
          content += '\n';
        }
      }
    }

    return content;
  }

  /**
   * Generate tasks.md from ISA
   */
  private generateTasks(isa: ISA): string {
    let content = '# Tasks\n\n';

    // Generate tasks from ISC criteria
    for (const criterion of isa.criteria) {
      const status = criterion.status === 'PASS' ? 'x' : ' ';
      content += `- [${status}] ${criterion.id}: ${criterion.description}\n`;
    }

    return content;
  }

  /**
   * Extract a section from markdown
   */
  private extractSection(markdown: string, sectionName: string): string {
    const regex = new RegExp(`## ${sectionName}\\n\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = markdown.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Extract a list from markdown section
   */
  private extractList(markdown: string, sectionName: string): string[] {
    const section = this.extractSection(markdown, sectionName);
    const lines = section.split('\n');
    const items: string[] = [];

    for (const line of lines) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        items.push(match[1]);
      }
    }

    return items;
  }

  /**
   * Parse acceptance criteria from requirements
   */
  private parseAcceptanceCriteria(requirements: string): ISC[] {
    const criteria: ISC[] = [];
    const lines = requirements.split('\n');
    let currentId = '';

    for (const line of lines) {
      // Match user story headers like "### ISC-1"
      const headerMatch = line.match(/^### (ISC-\d+)/);
      if (headerMatch) {
        currentId = headerMatch[1];
      }

      // Match acceptance criteria checkboxes
      const criteriaMatch = line.match(/^- \[([ x])\] (.+)$/);
      if (criteriaMatch && currentId) {
        criteria.push({
          id: currentId,
          description: criteriaMatch[2],
          status: criteriaMatch[1] === 'x' ? 'PASS' : 'PENDING',
        });
      }
    }

    return criteria;
  }

  /**
   * Parse tasks from tasks.md
   */
  private parseTasks(tasksMarkdown: string): Array<{ id: string; description: string; status: string }> {
    const tasks: Array<{ id: string; description: string; status: string }> = [];
    const lines = tasksMarkdown.split('\n');

    for (const line of lines) {
      const match = line.match(/^- \[([ x])\] (ISC-\d+): (.+)$/);
      if (match) {
        tasks.push({
          id: match[2],
          description: match[3],
          status: match[1] === 'x' ? 'completed' : 'pending',
        });
      }
    }

    return tasks;
  }

  /**
   * Read ISA from file
   */
  async readISA(filePath: string): Promise<ISA> {
    const content = await fs.readFile(filePath, 'utf-8');
    return this.parseISA(content);
  }

  /**
   * Parse ISA markdown content
   */
  private parseISA(content: string): ISA {
    return {
      problem: this.extractSection(content, 'Problem'),
      vision: this.extractSection(content, 'Vision'),
      outOfScope: this.extractList(content, 'Out of Scope'),
      principles: this.extractList(content, 'Principles'),
      constraints: this.extractList(content, 'Constraints'),
      goal: this.extractSection(content, 'Goal'),
      criteria: this.parseISCCriteria(content),
      testStrategy: this.extractSection(content, 'Test Strategy'),
      features: this.extractList(content, 'Features'),
      decisions: [],
      changelog: [],
      verification: [],
    };
  }

  /**
   * Parse ISC criteria from ISA
   */
  private parseISCCriteria(content: string): ISC[] {
    const criteriaSection = this.extractSection(content, 'Criteria');
    const lines = criteriaSection.split('\n');
    const criteria: ISC[] = [];

    for (const line of lines) {
      const match = line.match(/^- \[([ x])\] (ISC-\d+): (.+)$/);
      if (match) {
        criteria.push({
          id: match[2],
          description: match[3],
          status: match[1] === 'x' ? 'PASS' : 'PENDING',
        });
      }
    }

    return criteria;
  }

  /**
   * Write ISA to file
   */
  async writeISA(filePath: string, isa: ISA): Promise<void> {
    const content = this.formatISA(isa);
    await fs.writeFile(filePath, content);
  }

  /**
   * Format ISA as markdown
   */
  private formatISA(isa: ISA): string {
    let content = '# ISA - Ideal State Artifact\n\n';

    content += '## Problem\n\n';
    content += `${isa.problem}\n\n`;

    content += '## Vision\n\n';
    content += `${isa.vision}\n\n`;

    if (isa.outOfScope.length > 0) {
      content += '## Out of Scope\n\n';
      for (const item of isa.outOfScope) {
        content += `- ${item}\n`;
      }
      content += '\n';
    }

    if (isa.principles.length > 0) {
      content += '## Principles\n\n';
      for (const principle of isa.principles) {
        content += `- ${principle}\n`;
      }
      content += '\n';
    }

    if (isa.constraints.length > 0) {
      content += '## Constraints\n\n';
      for (const constraint of isa.constraints) {
        content += `- ${constraint}\n`;
      }
      content += '\n';
    }

    content += '## Goal\n\n';
    content += `${isa.goal}\n\n`;

    content += '## Criteria\n\n';
    for (const criterion of isa.criteria) {
      const status = criterion.status === 'PASS' ? 'x' : ' ';
      content += `- [${status}] ${criterion.id}: ${criterion.description}\n`;
    }
    content += '\n';

    content += '## Test Strategy\n\n';
    content += `${isa.testStrategy}\n\n`;

    if (isa.features.length > 0) {
      content += '## Features\n\n';
      for (const feature of isa.features) {
        content += `- ${feature}\n`;
      }
      content += '\n';
    }

    return content;
  }

  /**
   * Sync ISA with Kiro Spec (bidirectional)
   */
  async syncISAWithSpec(isaPath: string, specDir: string): Promise<void> {
    // Read ISA
    const isa = await this.readISA(isaPath);

    // Convert to Kiro Spec
    const spec = await this.isaToKiroSpec(isa);

    // Write Kiro Spec files
    await fs.writeFile(path.join(specDir, 'requirements.md'), spec.requirements);
    await fs.writeFile(path.join(specDir, 'design.md'), spec.design);
    await fs.writeFile(path.join(specDir, 'tasks.md'), spec.tasks);
  }

  /**
   * Sync Kiro Spec with ISA (reverse)
   */
  async syncSpecWithISA(specDir: string, isaPath: string): Promise<void> {
    // Read Kiro Spec files
    const requirements = await fs.readFile(path.join(specDir, 'requirements.md'), 'utf-8');
    const design = await fs.readFile(path.join(specDir, 'design.md'), 'utf-8');
    const tasks = await fs.readFile(path.join(specDir, 'tasks.md'), 'utf-8');

    const spec: KiroSpec = {
      type: 'feature',
      requirements,
      design,
      tasks,
    };

    // Convert to ISA
    const isa = await this.kiroSpecToISA(spec);

    // Write ISA
    await this.writeISA(isaPath, isa);
  }
}
