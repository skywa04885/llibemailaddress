export class EmailAddressFormatError extends Error {}

export class EmailAddress {
  public static ADDRESS_REGEXP: RegExp =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  /**
   * Constructs a new email address.
   * @param username the username.
   * @param hostname the hostname.
   * @param name the (optional) name.
   */
  public constructor(
    public readonly username: string,
    public readonly hostname: string,
    public readonly name: string | null = null
  ) {}

  /**
   * Gets the address, username and hostname combined.
   */
  public get address() {
    return `${this.username}@${this.hostname}`;
  }

  /**
   * Encodes the address.
   * @param simple if we shouldn't include the name.
   * @returns the encoded address.
   */
  public encode(simple: boolean = false): string {
    if (simple === true || this.name === null) {
      return `<${this.address}>`;
    }

    if (/^[a-zA-Z\d\s_\-.]+$/.test(this.name)) {
      const processedName: string = this.name.replace('"', '"');
      return `"${processedName}" <${this.address}>`;
    }

    return `${this.name} <${this.address}>`;
  }

  /**
   * Constructs an email address from an raw address.
   * @param raw the raw address.
   * @param name the name.
   * @returns The email address.
   */
  public static fromAddress(
    raw: string,
    name: string | null = null
  ): EmailAddress {
    // Makes sure the address is valid.
    if (!this.ADDRESS_REGEXP.test(raw)) {
      throw new EmailAddressFormatError(
        "E-Mail address is not in the propper format."
      );
    }

    // Splits the username and hostname from the address.
    const [username, hostname]: [string, string] = raw.split("@") as [
      string,
      string
    ];

    // Returns the email address.
    return new EmailAddress(username, hostname, name);
  }

  /**
   * Decodes an address and name from raw address string.
   * @param raw the raw string.
   * @returns the decoded email address.
   */
  public static decode(raw: string): EmailAddress {
    // Trims of extra nonsense, and removes extra spacing.
    raw = raw.replace(/\s+/, " ").trim();

    // Creates an temp address variable (because they may be modified).
    let name: string | null = null;

    // Checks if there is a quote, if so start processing it, to retreive the name.
    const quoteIndex: number = raw.indexOf('"');
    if (quoteIndex !== -1) {
      const openingIndex: number = quoteIndex;
      let currentIndex: number = openingIndex;
      let closingIndex: number = -1;

      // Stays in loop until we've found the closing index.
      for (
        currentIndex = openingIndex + 1;
        currentIndex < raw.length;
        ++currentIndex
      ) {
        const previouschar: string | null =
          currentIndex === openingIndex + 1
            ? null
            : raw.charAt(currentIndex - 1);
        const currentChar: string = raw.charAt(currentIndex);
        // Checks if we've found the closing quote, if so break.
        if (currentChar === '"' && previouschar !== "\\") {
          closingIndex = currentIndex;
          break;
        }
      }

      // If no closing index found, throw an error because the address is invalid.
      if (closingIndex === -1) {
        throw new EmailAddressFormatError("Could not find closing quote.");
      }

      // Gets the name from inside the brackets, and replace all the escaped quotes with quotes.
      name = raw.substring(openingIndex + 1, closingIndex).replace('\\"', '"');

      // Gets the rest of the address, as the remainder of the string.
      raw = raw.substring(closingIndex + 1).trim();
    }

    // Loop until we've found a bracket, which might include the name.
    let openingBracketIndex: number = -1;
    for (let index: number = 0; index < raw.length; ++index) {
      const currentChar: string = raw.charAt(index);
      if (currentChar === "<") {
        openingBracketIndex = index;
        break;
      }
    }

    // Checks if there was an opening bracket found, if not throw an error.
    if (openingBracketIndex === -1) {
      throw new EmailAddressFormatError("Could not find opening bracket.");
    }

    // Checks if the opening bracket index is larger than zero (more distant from the start)
    //  and if there is a name, if not, the slice will be the name.
    if (openingBracketIndex > 0 && name === null) {
      name = raw.slice(0, openingBracketIndex).trim();
    }

    // Finds the closing bracket index.
    let closingBracketIndex: number = -1;
    for (
      let index: number = openingBracketIndex + 1;
      index < raw.length;
      ++index
    ) {
      const currentChar: string = raw.charAt(index);
      if (currentChar === ">") {
        closingBracketIndex = index;
        break;
      }
    }

    // Checks if there is an closing bracket index, if not throw error.
    if (closingBracketIndex === -1) {
      throw new EmailAddressFormatError("Missing closing bracket.");
    }

    // Removes the brackets from the address.
    raw = raw.slice(openingBracketIndex + 1, closingBracketIndex);

    // Makes sure the address is valid.
    if (!this.ADDRESS_REGEXP.test(raw)) {
      throw new EmailAddressFormatError(
        "E-Mail address is not in the propper format."
      );
    }

    // Splits the username and hostname from the address.
    const [username, hostname]: [string, string] = raw.split("@") as [
      string,
      string
    ];

    // Returns the email address.
    return new EmailAddress(username, hostname, name);
  }
}
