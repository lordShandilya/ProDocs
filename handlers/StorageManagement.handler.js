import fs from "node:fs/promises";
import pt from "path";
import { fileURLToPath } from "node:url";


const __dirname = pt.dirname(fileURLToPath(import.meta.url));
const pendingWrites = new Map(); // id -> { timeout, update }
const WRITE_DELAY = 2000; // 2 seconds

const FileDirectory = new Map();

export async function initializeStorage() {
    try {
        const files = await fs.readdir(pt.join(__dirname, '../storage'));
        for (const file of files) {
            if (file.endsWith('_meta.json')) {
                try {
                    const meta = JSON.parse(await fs.readFile(pt.join(__dirname, `../storage/${file}`), 'utf-8'));
                    FileDirectory.set(file.replace('_meta.json', ''), { title: meta.title, path: pt.join( __dirname, `../storage/${file.replace('_meta.json', '.txt')}`) });

                } catch(e) {
                    continue;
                }
            }
        }
    } catch (error) {
        throw new Error("Failed to initialize storage", error);
    }
}

export async function CreateNewFile(title, content) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const file = pt.join(__dirname, `../storage/${id}.txt`);
    const metaFile = pt.join(__dirname, `../storage/${id}_meta.json`);

    try {
        await fs.writeFile(file, content);
        await fs.writeFile(metaFile, JSON.stringify({ title }));
        FileDirectory.set(id, { title, path: file });
    } catch (error) {
        throw new Error("Failed to create file", error);
    }
}

export async function FindFileById(id) {
    const fileMeta = FileDirectory.get(id);
    if (!fileMeta) {
        throw new Error("File not found");
    }
    const { title, path } = fileMeta;
    const content = await readFile(path);
    console.log(content);
    return {title, content};
}

async function writeFile(id, update) {
    try {
        const { path } = FileDirectory.get(id);
        await fs.writeFile(path, update);
        pendingWrites.delete(id);
        console.log(`Saved document ${id} to storage.`);
    } catch(e) {
        console.error(`Failed to save document ${id}:`, e);
    }
}

export async function DebouncedUpdateFileById(id, update) {
    const fileMeta = FileDirectory.get(id);
    if(!fileMeta) {
        throw new Error("File not found");
    }

    if(pendingWrites.has(id)) {
        const { timeout } = pendingWrites.get(id);
        clearTimeout(timeout);
    }
    const timeout = setTimeout(async () => {
        await writeFile(id, update);
    }, WRITE_DELAY);
    
    pendingWrites.set(id, { timeout, update});
    
}

export async function ForceSave(id) {
    if(!pendingWrites.has(id)) {
        console.log(`Nothing to write in document id:${id}`);
        return;
    }

    const { timeout, update } = pendingWrites.get(id);
    clearTimeout(timeout);
    writeFile(id, update);
    pendingWrites.delete(id);
    
}

async function readFile(path) {
    let content;
    try {
        content = await fs.readFile(path, 'utf-8');
        return content;
    } catch(e) {
        throw new Error("Failed to read file", e);
    }
}

export function ListAllFiles() {
    const files = [];
    for (const [id, { title, path }] of FileDirectory.entries()) {
        files.push({ id, title });
    }

    return files;
}

