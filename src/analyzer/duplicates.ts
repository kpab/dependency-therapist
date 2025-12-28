import { exec } from 'child_process';
import { promisify } from 'util';
import { Duplicate, DuplicateInstance } from '../types';

const execAsync = promisify(exec);

interface NpmLsNode {
  version?: string;
  dependencies?: Record<string, NpmLsNode>;
}

/**
 * npm ls の結果から依存関係ツリーを走査し、重複パッケージを検出
 */
function analyzeDependencyTree(tree: NpmLsNode): Duplicate[] {
  const packageMap = new Map<string, DuplicateInstance[]>();

  function traverse(node: NpmLsNode, path: string = ''): void {
    if (!node.dependencies) return;

    Object.entries(node.dependencies).forEach(([name, dep]) => {
      const version = dep.version || 'unknown';
      const currentPath = path ? `${path}/${name}` : name;

      if (!packageMap.has(name)) {
        packageMap.set(name, []);
      }

      const instances = packageMap.get(name)!;

      // 同じバージョン・パスの重複を避ける
      if (!instances.some(i => i.version === version && i.path === currentPath)) {
        instances.push({ version, path: currentPath });
      }

      traverse(dep, currentPath);
    });
  }

  traverse(tree);

  // 複数インスタンスを持つパッケージのみをフィルタ
  const duplicates: Duplicate[] = [];
  packageMap.forEach((instances, name) => {
    if (instances.length > 1) {
      const versions = [...new Set(instances.map(i => i.version))];

      duplicates.push({
        name,
        versions,
        count: instances.length,
        instances,
      });
    }
  });

  return duplicates.sort((a, b) => b.count - a.count);
}

/**
 * 重複パッケージをスキャン
 */
export async function scanDuplicates(projectPath: string): Promise<Duplicate[]> {
  try {
    const { stdout } = await execAsync('npm ls --json --all', {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10, // 10MB
    });

    const tree = JSON.parse(stdout) as NpmLsNode;
    return analyzeDependencyTree(tree);
  } catch (error: any) {
    // npm ls はエラーがある場合でもcode 1で終了するが、stdoutにはJSONが含まれる
    if (error.stdout) {
      try {
        const tree = JSON.parse(error.stdout) as NpmLsNode;
        return analyzeDependencyTree(tree);
      } catch {
        // JSONパースに失敗
      }
    }
    console.warn('Failed to scan duplicates:', (error as Error).message);
    return [];
  }
}
