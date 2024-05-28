const loadFactor = 0.75;

const UndefinedKeyError = new Error('Key not defined');

class HashMap {
  #buckets;
  #capacity;
  #length;

  constructor() {
    this.#buckets = [];
    this.#capacity = 16;
    this.#length = 0;
    for (let i = 0; i < this.#capacity; ++i) {
      this.#buckets[i] = new BucketList();
    }
  }

  get length() {
    return this.#length;
  }

  get keys() {
    const keys = [];
    for (const bucket of this.#buckets) {
      for (const key of bucket.keys) {
        keys.push(key);
      }
    }
    return keys;
  }

  get values() {
    const values = [];
    for (const bucket of this.#buckets) {
      for (const value of bucket.values) {
        values.push(value);
      }
    }
    return values;
  }

  get entries() {
    const entries = [];
    for (const bucket of this.#buckets) {
      for (const entry of bucket.entries) {
        entries.push(entry);
      }
    }
    return entries;
  }

  set(key, value) {
    if (key !== null && key !== undefined) {
      const hashCode = this.#hash(key);
      if (this.#buckets[hashCode].insert(key, value)) {
        this.#length++;
        this.#grow();
      }
    } else {
      throw UndefinedKeyError;
    }
  }

  get(key) {
    if (key !== null && key !== undefined) {
      const hashCode = this.#hash(key);
      return this.#buckets[hashCode].get(key);
    } else {
      throw UndefinedKeyError;
    }
  }

  has(key) {
    if (key !== null && key !== undefined) {
      const hashCode = this.#hash(key);
      return this.#buckets[hashCode].has(key);
    } else {
      throw UndefinedKeyError;
    }
  }

  remove(key) {
    if (key !== null && key !== undefined) {
      const hashCode = this.#hash(key);

      const success = this.#buckets[hashCode].remove(key);
      if (success) {
        this.#length--;
        return true;
      }
    } else {
      throw UndefinedKeyError;
    }
    return false;
  }

  clear() {
    for (const bucket of this.#buckets) {
      bucket.clear();
    }
    this.#length = 0;
  }

  #grow() {
    if (this.#length / this.#capacity >= loadFactor) {
      const entries = [...this.entries];
      const capacityOld = this.#capacity;

      this.#capacity *= 2;
      this.clear();

      for (let i = capacityOld; i < this.#capacity; ++i) {
        this.#buckets[i] = new BucketList();
      }

      for (let entry of entries) {
        this.set(entry.key, entry.value);
      }

      return true;
    }
    return false;
  }

  #hash(key) {
    if (key !== null && key !== undefined) {
      let hashCode = 0;
      const primeNumber = 31;

      for (let i = 0; i < key.length; i++) {
        hashCode = primeNumber * (hashCode + key.charCodeAt(i));
      }
      hashCode = hashCode % this.#capacity;

      this.#checkBounds[hashCode];
      return hashCode;
    } else {
      throw UndefinedKeyError;
    }
  }

  #checkBounds(index) {
    if (index < 0 || index >= this.#capacity) {
      throw new Error(`Index out of bounds: ${index}`);
    }
  }
}

class BucketList {
  #head;
  #tail;
  #length;

  constructor() {
    this.#head = null;
    this.#tail = null;
    this.#length = 0;
  }

  get head() {
    return this.#head;
  }
  get tail() {
    return this.#tail;
  }
  get length() {
    return this.#length;
  }

  get keys() {
    const keys = [];
    let node = this.#head;
    while (node !== null) {
      keys.push(node.key);
      node = node.next;
    }
    return keys;
  }

  get values() {
    const values = [];
    let node = this.#head;
    while (node !== null) {
      values.push(node.value);
      node = node.next;
    }
    return values;
  }

  get entries() {
    const entries = [];
    let node = this.#head;
    while (node !== null) {
      entries.push({ key: node.key, value: node.value });
      node = node.next;
    }
    return entries;
  }

  insert(key, value) {
    if (key !== null && key !== undefined) {
      let node = this.#find(key);
      if (node !== null) {
        node.value = value;
      } else {
        this.#append(key, value);
        return true;
      }
    } else {
      throw UndefinedKeyError;
    }
    return false;
  }

  remove(key) {
    if (key !== null && key !== undefined) {
      let node = this.#find(key);
      if (node !== null) {
        if (node.previous !== null) {
          node.previous.next = node.next;
        } else {
          this.#head = null;
        }
        if (node.next !== null) {
          node.next.previous = node.previous;
        } else {
          this.#tail = null;
        }
        node = null;
        this.#length--;

        return true;
      }
    } else {
      throw UndefinedKeyError;
    }
    return false;
  }

  get(key) {
    let node = this.#find(key);
    if (node !== null) {
      return node.value;
    }
    return null;
  }

  has(key) {
    let node = this.#find(key);
    if (node !== null) {
      return true;
    }
    return false;
  }

  clear() {
    while (this.length > 0) {
      this.#pop();
    }
  }

  #find(key) {
    let node = this.#head;
    while (node !== null) {
      if (node.key === key) {
        return node;
      }
      node = node.next;
    }
    return null;
  }

  #append(key, value) {
    const node = new Node(key, value);
    if (this.#head !== null) {
      this.#tail.next = node;
      node.previous = this.#tail;
      this.#tail = node;
    } else {
      this.#head = node;
      this.#tail = node;
    }
    this.#length++;
  }

  #pop() {
    if (this.#length > 0) {
      if (this.#length > 1) {
        this.#tail = this.#tail.previous;
        this.#tail.next = null;
      } else {
        this.#tail = null;
        this.#head = null;
      }
      this.#length--;
    }
  }
}

class Node {
  key;
  value;
  next;
  previous;

  constructor(key = null, value = null, next = null, previous = null) {
    if (key !== null && key !== undefined) {
      this.key = key;
      this.value = value;
      this.next = next;
      this.previous = previous;
    } else {
      throw new Error('Key not defined');
    }
  }
}
