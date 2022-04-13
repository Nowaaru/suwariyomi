const parseQuery = (searchQuery: string) => {
  const splitQuery = searchQuery.split(' ');
  const parsedQueries: string[] = [];
  const quotationStore: string[] = [];

  splitQuery.forEach((query: string) => {
    if (query.startsWith('"') && !query.endsWith('"')) {
      quotationStore.push(query.slice(1));
      return;
    }

    if (quotationStore.length) {
      if (query.endsWith('"')) {
        quotationStore.push(query.slice(0, -1));
        parsedQueries.push(quotationStore.join(' '));
        // reset quotation store
        while (quotationStore.length) quotationStore.pop();
        return;
      }

      quotationStore.push(query);
    }
    parsedQueries.push(query);
  });

  if (quotationStore.length) return false;
  return parsedQueries.map((x) => x.replace(/(^")|("$)/g, ''));
};

export default parseQuery;
