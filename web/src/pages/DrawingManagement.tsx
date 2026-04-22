import { ChangeEvent, DragEvent, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid2 as Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Description as DrawingIcon,
  History as HistoryIcon,
  Search as SearchIcon,
  UploadFile as VersionIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { DrawingFormat, sites } from '../data/mockData';

type UploadFormState = {
  siteId: string;
  title: string;
  location: string;
  assetTag: string;
  discipline: string;
  format: DrawingFormat;
  fileName: string;
  uploadedBy: string;
  note: string;
};

const drawingFormats: DrawingFormat[] = ['CAD', 'JPEG', 'PDF'];

const formatColor: Record<DrawingFormat, string> = {
  CAD: '#42A5F5',
  JPEG: '#AB47BC',
  PDF: '#EF5350',
};

export default function DrawingManagement() {
  const theme = useTheme();
  const { selectedSiteId, drawingDocuments, addDrawingDocument, addDrawingVersion } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');
  const [formatFilter, setFormatFilter] = useState<DrawingFormat | 'all'>('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(drawingDocuments[0]?.id || null);
  const [newVersionFileName, setNewVersionFileName] = useState('');
  const [newVersionNote, setNewVersionNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    siteId: selectedSiteId || 'site-1',
    title: '',
    location: '',
    assetTag: '',
    discipline: 'Architecture',
    format: 'PDF',
    fileName: '',
    uploadedBy: 'user-2',
    note: '',
  });

  const selectedDocument = useMemo(
    () => drawingDocuments.find((document) => document.id === selectedDocumentId) || null,
    [drawingDocuments, selectedDocumentId]
  );

  const filteredDocuments = useMemo(() => {
    const loweredSearchTerm = searchTerm.trim().toLowerCase();
    const loweredLocationFilter = locationFilter.trim().toLowerCase();
    const loweredAssetFilter = assetFilter.trim().toLowerCase();

    return drawingDocuments
      .filter((document) => (formatFilter === 'all' ? true : document.format === formatFilter))
      .filter((document) =>
        loweredLocationFilter ? document.location.toLowerCase().includes(loweredLocationFilter) : true
      )
      .filter((document) => (loweredAssetFilter ? document.assetTag.toLowerCase().includes(loweredAssetFilter) : true))
      .filter((document) => {
        if (!loweredSearchTerm) {
          return true;
        }
        return (
          document.documentNo.toLowerCase().includes(loweredSearchTerm)
          || document.title.toLowerCase().includes(loweredSearchTerm)
          || document.discipline.toLowerCase().includes(loweredSearchTerm)
        );
      })
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [assetFilter, drawingDocuments, formatFilter, locationFilter, searchTerm]);

  const handlePickedFile = (fileName: string) => {
    setUploadForm((current) => ({ ...current, fileName }));
  };

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (!droppedFile) {
      return;
    }
    handlePickedFile(droppedFile.name);
  };

  const handleFileBrowse = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }
    handlePickedFile(selectedFile.name);
  };

  const handleUploadDocument = () => {
    addDrawingDocument({
      siteId: uploadForm.siteId,
      title: uploadForm.title,
      location: uploadForm.location,
      assetTag: uploadForm.assetTag,
      format: uploadForm.format,
      discipline: uploadForm.discipline,
      fileName: uploadForm.fileName,
      uploadedBy: uploadForm.uploadedBy,
      note: uploadForm.note,
    });

    setUploadForm((current) => ({
      ...current,
      title: '',
      location: '',
      assetTag: '',
      fileName: '',
      note: '',
    }));
  };

  const handleAddVersion = () => {
    if (!selectedDocumentId) {
      return;
    }

    addDrawingVersion(selectedDocumentId, {
      fileName: newVersionFileName,
      uploadedBy: uploadForm.uploadedBy,
      note: newVersionNote,
    });

    setNewVersionFileName('');
    setNewVersionNote('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Drawing Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Controlled drawing index with upload workflow and revision history
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <UploadIcon fontSize="small" /> Upload Drawing
              </Typography>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Facility"
                    value={uploadForm.siteId}
                    onChange={(event) => setUploadForm((current) => ({ ...current, siteId: event.target.value }))}
                  >
                    {sites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>{site.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="Format"
                    value={uploadForm.format}
                    onChange={(event) => setUploadForm((current) => ({ ...current, format: event.target.value as DrawingFormat }))}
                  >
                    {drawingFormats.map((drawingFormat) => (
                      <MenuItem key={drawingFormat} value={drawingFormat}>{drawingFormat}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Document Title"
                    value={uploadForm.title}
                    onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Location"
                    value={uploadForm.location}
                    onChange={(event) => setUploadForm((current) => ({ ...current, location: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Asset Tag"
                    value={uploadForm.assetTag}
                    onChange={(event) => setUploadForm((current) => ({ ...current, assetTag: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Discipline"
                    value={uploadForm.discipline}
                    onChange={(event) => setUploadForm((current) => ({ ...current, discipline: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Uploaded By"
                    value={uploadForm.uploadedBy}
                    onChange={(event) => setUploadForm((current) => ({ ...current, uploadedBy: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    onDrop={handleFileDrop}
                    onDragOver={(event) => event.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: '1.5px dashed',
                      borderColor: uploadForm.fileName ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: alpha(theme.palette.primary.main, uploadForm.fileName ? 0.08 : 0.02),
                    }}
                  >
                    <UploadIcon color={uploadForm.fileName ? 'primary' : 'disabled'} />
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                      {uploadForm.fileName || 'Drag and drop drawing file here'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      or click to browse CAD / JPEG / PDF files
                    </Typography>
                  </Box>
                  <input ref={fileInputRef} type="file" hidden onChange={handleFileBrowse} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Upload Note"
                    value={uploadForm.note}
                    onChange={(event) => setUploadForm((current) => ({ ...current, note: event.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleUploadDocument}>
                    Add to Document Index
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <HistoryIcon fontSize="small" /> Version History
              </Typography>

              {selectedDocument ? (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selectedDocument.documentNo}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedDocument.title} · {selectedDocument.location}
                  </Typography>

                  {selectedDocument.versions
                    .slice()
                    .reverse()
                    .map((version) => (
                      <Box
                        key={version.id}
                        sx={{
                          p: 1.25,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {version.versionLabel} · {version.fileName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(version.uploadedAt), 'dd MMM yyyy')}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {version.note || 'No note provided'}
                        </Typography>
                      </Box>
                    ))}

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload New Version</Typography>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="File Name"
                          value={newVersionFileName}
                          onChange={(event) => setNewVersionFileName(event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Revision Note"
                          value={newVersionNote}
                          onChange={(event) => setNewVersionNote(event.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<VersionIcon />}
                          onClick={handleAddVersion}
                          sx={{ height: '100%' }}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a document from the table to review its version history.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              size="small"
              placeholder="Search by document no., title, or discipline"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
            <TextField
              size="small"
              label="Location"
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              sx={{ minWidth: 180 }}
            />
            <TextField
              size="small"
              label="Asset"
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size="small"
              select
              label="Format"
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value as DrawingFormat | 'all')}
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="all">All</MenuItem>
              {drawingFormats.map((drawingFormat) => (
                <MenuItem key={drawingFormat} value={drawingFormat}>{drawingFormat}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Document No.</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Asset</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Current Version</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.map((document) => (
                  <TableRow
                    key={document.id}
                    hover
                    selected={document.id === selectedDocumentId}
                    onClick={() => setSelectedDocumentId(document.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <DrawingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        {document.documentNo}
                      </Typography>
                    </TableCell>
                    <TableCell>{document.title}</TableCell>
                    <TableCell>{document.location}</TableCell>
                    <TableCell>{document.assetTag}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={document.format}
                        sx={{
                          backgroundColor: alpha(formatColor[document.format], 0.15),
                          color: formatColor[document.format],
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{document.currentVersion}</TableCell>
                    <TableCell>{format(new Date(document.uploadedAt), 'dd MMM yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
