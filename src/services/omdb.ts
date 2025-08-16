const OMDB_BASE_URL = process.env.NEXT_PUBLIC_OMDB_BASE_URL;
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;

interface OMDbMovie {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
  Plot?: string;
  Director?: string;
  Actors?: string;
  imdbRating?: string;
  Runtime?: string;
}

class OMDbService {
  private async fetchFromOMDb(params: Record<string, any>): Promise<OMDbMovie> {
    const url = new URL(OMDB_BASE_URL!);
    url.searchParams.append('apikey', OMDB_API_KEY!);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`OMDb API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getMovieByTitle(title: string, year?: number): Promise<OMDbMovie> {
    const params: Record<string, any> = { 
      t: title,
      plot: 'full',
    };
    
    if (year) params.y = year;
    
    return this.fetchFromOMDb(params);
  }

  async getMovieByIMDbId(imdbId: string): Promise<OMDbMovie> {
    return this.fetchFromOMDb({ 
      i: imdbId,
      plot: 'full',
    });
  }
}

export const omdbService = new OMDbService();